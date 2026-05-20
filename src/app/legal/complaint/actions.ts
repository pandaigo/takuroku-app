'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_REASONS = [
  'impersonation',
  'harassment',
  'privacy',
  'defamation',
  'illegal',
  'other',
] as const

const URGENT_REASONS = ['impersonation', 'harassment']

// Discord Webhook で運営者に通報通知（env未設定なら静かにスキップ）
async function notifyDiscord(c: {
  reason: string
  targetKind: string
  targetRef: string
  reporterEmail: string | null
  details: string | null
}) {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) return
  const isUrgent = URGENT_REASONS.includes(c.reason)
  const lines = [
    `**${isUrgent ? '[緊急] 通報受信' : '通報受信'}**`,
    `理由: ${c.reason}`,
    `対象: ${c.targetKind} / ${c.targetRef}`,
    `連絡先: ${c.reporterEmail || '(なし)'}`,
  ]
  if (c.details) {
    const trimmed = c.details.length > 500 ? c.details.slice(0, 500) + '…' : c.details
    lines.push(`詳細: ${trimmed}`)
  }
  lines.push('管理画面: /admin/complaints')

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: lines.join('\n'),
        allowed_mentions: { parse: [] },
      }),
    })
  } catch {
    // 通知失敗は本体に影響させない（通報DBには既に入っている）
  }
}

// 通報の受付（ログイン不要）。受領後の処理は運用側でレビュー。
export async function submitComplaint(formData: FormData) {
  const targetKindRaw = String(formData.get('target_kind') ?? 'other')
  const targetKind = [
    'public_link',
    'member',
    'group',
    'session',
    'other',
  ].includes(targetKindRaw)
    ? targetKindRaw
    : 'other'
  const targetRefInput = String(formData.get('target_ref') ?? '').trim()
  const targetRef = targetRefInput || '(unspecified)'
  const reasonRaw = String(formData.get('reason') ?? '').trim()
  const reason = (ALLOWED_REASONS as readonly string[]).includes(reasonRaw)
    ? reasonRaw
    : 'other'
  const details = String(formData.get('details') ?? '').trim()
  const reporterEmail = String(formData.get('reporter_email') ?? '').trim()

  if (!targetRefInput && !details) {
    redirect(
      '/legal/complaint?error=' +
        encodeURIComponent('対象または詳細のいずれかを入れてください'),
    )
  }
  if (details.length > 4000) {
    redirect(
      '/legal/complaint?error=' +
        encodeURIComponent('詳細は4000文字以内にしてください'),
    )
  }

  const supabase = await createClient()

  // レート制限：同じ対象への通報は1時間に3件まで
  const { data: allowed } = await supabase.rpc('check_complaint_rate', {
    p_target_ref: targetRef,
  })
  if (allowed === false) {
    redirect(
      '/legal/complaint?error=' +
        encodeURIComponent(
          '同じ対象への通報が短時間に集中しています。時間をおいて再度お試しください。',
        ),
    )
  }

  const { data: authData } = await supabase.auth.getClaims()
  const reporterUserId =
    typeof authData?.claims?.sub === 'string' ? authData.claims.sub : null

  await supabase.from('complaints').insert({
    target_kind: targetKind,
    target_ref: targetRef,
    reporter_email: reporterEmail || null,
    reporter_user_id: reporterUserId,
    reason,
    details: details || null,
    status: 'pending',
  })

  // 計測（ログインユーザーの通報のみ user_id 付き）
  if (reporterUserId) {
    void supabase.from('events').insert({
      user_id: reporterUserId,
      type: 'complaint_filed',
    })
  }

  // Discord 通知（fire-and-forget）
  void notifyDiscord({
    reason,
    targetKind,
    targetRef,
    reporterEmail: reporterEmail || null,
    details: details || null,
  })

  redirect('/legal/complaint?submitted=1')
}
