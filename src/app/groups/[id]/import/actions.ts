'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'

// シンプル CSV パーサ：改行で行分割、カンマで列分割、ダブルクォート対応なし。
// セル内のカンマが必要なケースは将来対応（現状は出席者を「・」で区切る前提）。
function parseCsvRows(text: string): string[][] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  return lines.map((l) => l.split(',').map((s) => s.trim()))
}

const DATE_RE = /^\d{4}-\d{1,2}-\d{1,2}$/
const ALLOWED_STATUS = new Set(['cleared', 'ongoing', 'tpk'])
const MAX_ROWS = 500

export async function importSessions(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')

  const groupId = String(formData.get('group_id') ?? '')
  const csv = String(formData.get('csv') ?? '').trim()
  if (!groupId) redirect('/')
  if (!csv) {
    redirect(
      `/groups/${groupId}/import?error=` +
        encodeURIComponent('CSV が空です'),
    )
  }

  const supabase = await createClient()

  // 既存メンバー（同じ卓・未削除）を名前→idでマップ化。重複名は最初の id を採用。
  const { data: existingMembers } = await supabase
    .from('members')
    .select('id, display_name')
    .eq('group_id', groupId)
    .is('deleted_at', null)
  const memberMap = new Map<string, string>()
  for (const m of existingMembers ?? []) {
    if (!memberMap.has(m.display_name)) memberMap.set(m.display_name, m.id)
  }

  const allRows = parseCsvRows(csv)
  // 1 行目がヘッダ（最初の列が日付フォーマットでない）なら除外
  const firstFirst = allRows[0]?.[0] ?? ''
  const rows =
    firstFirst && !DATE_RE.test(firstFirst) ? allRows.slice(1) : allRows

  if (rows.length === 0) {
    redirect(
      `/groups/${groupId}/import?error=` +
        encodeURIComponent('取り込める行がありません（ヘッダのみ？）'),
    )
  }
  if (rows.length > MAX_ROWS) {
    redirect(
      `/groups/${groupId}/import?error=` +
        encodeURIComponent(
          `1 回に取り込めるのは ${MAX_ROWS} 行までです（${rows.length} 行）`,
        ),
    )
  }

  let inserted = 0
  let failed = 0
  const errorMsgs: string[] = []

  for (const [i, row] of rows.entries()) {
    const lineNo = i + 1
    const [
      playedOn = '',
      title = '',
      attendeesRaw = '',
      note = '',
      statusRaw = '',
    ] = row

    if (!DATE_RE.test(playedOn)) {
      failed++
      if (errorMsgs.length < 5) {
        errorMsgs.push(`行 ${lineNo}: 日付の形式が不正（${playedOn}）`)
      }
      continue
    }
    if (!title) {
      failed++
      if (errorMsgs.length < 5) errorMsgs.push(`行 ${lineNo}: タイトルが空`)
      continue
    }

    const status = ALLOWED_STATUS.has(statusRaw) ? statusRaw : null

    const { data: session, error: insertErr } = await supabase
      .from('sessions')
      .insert({
        group_id: groupId,
        played_on: playedOn,
        title,
        note: note || null,
        status,
        created_by: uid,
      })
      .select('id')
      .single()

    if (insertErr || !session) {
      failed++
      if (errorMsgs.length < 5) {
        errorMsgs.push(`行 ${lineNo}: 記録に失敗（${insertErr?.message ?? '不明'}）`)
      }
      continue
    }

    // 出席者：「・」「,」「、」「/」で区切り。未登録の名前は自動で members を新規作成。
    const names = attendeesRaw
      .split(/[・、,\/]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    const attendeeIds: string[] = []
    for (const name of names) {
      let id = memberMap.get(name)
      if (!id) {
        const { data: newMember } = await supabase
          .from('members')
          .insert({ group_id: groupId, display_name: name })
          .select('id')
          .single()
        if (newMember?.id) {
          id = newMember.id
          memberMap.set(name, newMember.id)
        }
      }
      if (id) attendeeIds.push(id)
    }

    if (attendeeIds.length > 0) {
      await supabase.from('session_attendees').insert(
        attendeeIds.map((memberId) => ({
          session_id: session.id,
          member_id: memberId,
        })),
      )
    }

    inserted++
  }

  // 計測：CSV インポートが利用されたか
  await supabase.from('events').insert({
    user_id: uid,
    group_id: groupId,
    type: 'sessions_imported',
  })

  revalidatePath(`/groups/${groupId}`)

  const params = new URLSearchParams({ inserted: String(inserted) })
  if (failed > 0) params.set('failed', String(failed))
  if (errorMsgs.length > 0) params.set('errors', errorMsgs.join(' / '))
  redirect(`/groups/${groupId}/import?${params.toString()}`)
}
