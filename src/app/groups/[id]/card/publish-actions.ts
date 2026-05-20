'use server'

import { randomBytes } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'

// 公開URL発行：同意確認（メンバー名の公開）を経て、推測不能トークンで発行。
export async function publishCard(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')

  const groupId = String(formData.get('group_id') ?? '')
  const consent = formData.get('consent')
  if (!groupId) redirect('/')
  if (consent !== 'on') {
    redirect(`/groups/${groupId}/card?error=consent_required`)
  }

  // 推測不能トークン：16バイト乱数 → base64url（22文字）
  const token = randomBytes(16).toString('base64url')

  const supabase = await createClient()
  const { error } = await supabase.from('public_links').insert({
    group_id: groupId,
    token,
    created_by: uid,
    consent_confirmed_at: new Date().toISOString(),
    index_allowed: false,
  })
  if (error) {
    redirect(`/groups/${groupId}/card?error=publish_failed`)
  }

  await supabase.from('events').insert({
    user_id: uid,
    group_id: groupId,
    type: 'card_url_published',
  })

  revalidatePath(`/groups/${groupId}/card`)
  redirect(`/groups/${groupId}/card?published=1`)
}

// 公開URLの失効。主催はいつでも失効できる（D9）。
export async function revokePublicLink(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')

  const groupId = String(formData.get('group_id') ?? '')
  const linkId = String(formData.get('link_id') ?? '')
  if (!groupId || !linkId) redirect(`/groups/${groupId}/card`)

  const supabase = await createClient()
  await supabase
    .from('public_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', linkId)

  await supabase.from('events').insert({
    user_id: uid,
    group_id: groupId,
    type: 'card_url_revoked',
  })

  revalidatePath(`/groups/${groupId}/card`)
  redirect(`/groups/${groupId}/card?revoked=1`)
}
