'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'
import { KIND_LABEL } from '@/lib/genre'

// Discord Webhook URL の最低限の正規化＋検証。
// Discord 公式パターン：https://discord(app).com/api/webhooks/<id>/<token>
const DISCORD_WEBHOOK_RE =
  /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/

// 卓設定（現状 Discord Webhook URL のみ）の保存。
export async function updateGroupSettings(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')

  const groupId = String(formData.get('group_id') ?? '')
  const webhookRaw = String(formData.get('discord_webhook_url') ?? '').trim()
  if (!groupId) redirect('/')

  // 空文字なら null（解除）として保存。値があれば形式チェック。
  let webhook: string | null = null
  if (webhookRaw.length > 0) {
    if (!DISCORD_WEBHOOK_RE.test(webhookRaw)) {
      redirect(
        `/groups/${groupId}?error=` +
          encodeURIComponent(
            'Discord Webhook URL の形式が正しくありません（https://discord.com/api/webhooks/... 形式）',
          ),
      )
    }
    webhook = webhookRaw
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('groups')
    .update({ discord_webhook_url: webhook })
    .eq('id', groupId)
  if (error) {
    redirect(
      `/groups/${groupId}?error=` +
        encodeURIComponent('設定の保存に失敗しました'),
    )
  }
  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}?message=` + encodeURIComponent('設定を保存しました'))
}

// セッション記録時に主催の Discord Webhook へ embed を投稿（fire-and-forget）。
// 失敗は本体に影響させない（記録 DB には既に入っている）。
async function postSessionToDiscord(params: {
  webhookUrl: string
  groupName: string
  category: string
  playedOn: string
  title: string
  attendeeCount: number
  note: string | null
  noteSpoiler: boolean
  publicUrl: string | null
}) {
  const {
    webhookUrl,
    groupName,
    category,
    playedOn,
    title,
    attendeeCount,
    note,
    noteSpoiler,
    publicUrl,
  } = params
  const kindLabel = KIND_LABEL[category] ?? category
  // category 別アクセントカラー（公開カードの種別マークと一致させる）
  const COLOR: Record<string, number> = {
    trpg: 0x1e3a5f,
    mystery: 0x1a1815,
    werewolf: 0x7a1f1f,
    boardgame: 0x3d7068,
    other: 0x5c5247,
  }
  const noteText = note
    ? noteSpoiler
      ? `||「${note}」||` // Discord のスポイラー記法
      : `「${note}」`
    : null
  const fields: { name: string; value: string; inline?: boolean }[] = [
    { name: '日付', value: playedOn, inline: true },
    {
      name: '出席',
      value: `${attendeeCount}名`,
      inline: true,
    },
  ]
  if (noteText) {
    fields.push({ name: 'ひとこと', value: noteText })
  }
  const payload = {
    username: '卓録',
    embeds: [
      {
        title: `🎲 ${title}`,
        description: `**${groupName}** ／ ${kindLabel}`,
        color: COLOR[category] ?? COLOR.other,
        fields,
        url: publicUrl ?? undefined,
        footer: { text: 'takuroku' },
        timestamp: new Date().toISOString(),
      },
    ],
    allowed_mentions: { parse: [] },
  }
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // 静かに無視
  }
}

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

  // Discord Webhook 投稿（Pro 機能 #1・fire-and-forget で本体は止めない）
  const { data: groupInfo } = await supabase
    .from('groups')
    .select('name, category, discord_webhook_url')
    .eq('id', groupId)
    .single()
  if (groupInfo?.discord_webhook_url) {
    const { data: activeLink } = await supabase
      .from('public_links')
      .select('token')
      .eq('group_id', groupId)
      .is('revoked_at', null)
      .is('suspended_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const publicUrl = activeLink ? `${siteUrl}/c/${activeLink.token}` : null

    void postSessionToDiscord({
      webhookUrl: groupInfo.discord_webhook_url,
      groupName: groupInfo.name,
      category: groupInfo.category,
      playedOn,
      title,
      attendeeCount: attendeeIds.length,
      note: note || null,
      noteSpoiler,
      publicUrl,
    })
  }

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
