'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'

// メンバー追加（主催が代理で。本人登録は不要）。
// ペルソナレビュー（はる）の指摘：本人同意のチェックを UI で明示要求する。
// 規約文だけだと主催への運用責任丸投げに見える → アプリ側で都度確認する。
export async function addMember(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')

  const groupId = String(formData.get('group_id') ?? '')
  const displayName = String(formData.get('display_name') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  const consentConfirmed = formData.get('consent_confirmed') === 'on'
  if (!groupId) redirect('/')
  if (!displayName) {
    redirect(
      `/groups/${groupId}?error=` +
        encodeURIComponent('名前を入れてください'),
    )
  }
  if (!consentConfirmed) {
    redirect(
      `/groups/${groupId}?error=` +
        encodeURIComponent('本人同意のチェックが必要です'),
    )
  }

  const supabase = await createClient()
  // RLS: 親 group の owner 以外は insert できない。エラーは握り潰さず通知。
  const { error } = await supabase.from('members').insert({
    group_id: groupId,
    display_name: displayName,
    role: role || null,
  })
  if (error) {
    redirect(
      `/groups/${groupId}?error=` +
        encodeURIComponent('メンバー追加に失敗しました'),
    )
  }
  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}`)
}

// セッション記録（10秒入力）。出席者と計測イベントも記録。
export async function addSession(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')

  const groupId = String(formData.get('group_id') ?? '')
  const playedOn = String(formData.get('played_on') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim()
  const noteSpoiler = formData.get('note_spoiler') === 'on'
  const status = String(formData.get('status') ?? '').trim()
  const attendees = formData.getAll('attendee').map((v) => String(v))
  // その場で入力された新しい人（ゲスト）。カンマ／読点／改行で区切る。
  const guestNames = String(formData.get('new_attendees') ?? '')
    .split(/[,、\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (!groupId || !playedOn || !title) {
    redirect(`/groups/${groupId}`)
  }

  const supabase = await createClient()

  // 二重送信防止：同じ卓・同日・同タイトルの直近5秒以内の記録があればスキップ。
  const { data: recentDup } = await supabase
    .from('sessions')
    .select('id')
    .eq('group_id', groupId)
    .eq('played_on', playedOn)
    .eq('title', title)
    .eq('created_by', uid)
    .gte('created_at', new Date(Date.now() - 5000).toISOString())
    .maybeSingle()
  if (recentDup) {
    redirect(`/groups/${groupId}`)
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      group_id: groupId,
      played_on: playedOn,
      title,
      note: note || null,
      note_spoiler: noteSpoiler,
      status: status || null,
      created_by: uid,
    })
    .select('id')
    .single()

  if (error || !session) {
    redirect(`/groups/${groupId}`)
  }

  // ゲストを members に作成して出席者に含める（記録画面から離脱させない）。
  const attendeeIds = [...attendees]
  if (guestNames.length > 0) {
    const { data: newMembers } = await supabase
      .from('members')
      .insert(
        guestNames.map((display_name) => ({
          group_id: groupId,
          display_name,
        })),
      )
      .select('id')
    for (const m of newMembers ?? []) attendeeIds.push(m.id)
  }

  if (attendeeIds.length > 0) {
    await supabase.from('session_attendees').insert(
      attendeeIds.map((memberId) => ({
        session_id: session.id,
        member_id: memberId,
      })),
    )
  }

  // 撤退ライン計測：無催促のセッション記録をカウントする素。
  await supabase.from('events').insert({
    user_id: uid,
    group_id: groupId,
    type: 'session_logged',
  })

  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}`)
}

// メンバー削除（ソフト削除＝過去カード/履歴の表示は壊れない）。
export async function deleteMember(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')
  const groupId = String(formData.get('group_id') ?? '')
  const memberId = String(formData.get('member_id') ?? '')
  if (!groupId || !memberId) redirect(`/groups/${groupId}`)

  const supabase = await createClient()
  await supabase
    .from('members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', memberId)

  await supabase.from('events').insert({
    user_id: uid,
    group_id: groupId,
    type: 'member_deleted',
  })

  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}`)
}

// セッション削除（ソフト削除＝誤入力を取り消せる、後で復元する余地）。
export async function deleteSession(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')
  const groupId = String(formData.get('group_id') ?? '')
  const sessionId = String(formData.get('session_id') ?? '')
  if (!groupId || !sessionId) redirect(`/groups/${groupId}`)

  const supabase = await createClient()
  await supabase
    .from('sessions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', sessionId)

  await supabase.from('events').insert({
    user_id: uid,
    group_id: groupId,
    type: 'session_deleted',
  })

  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}`)
}
