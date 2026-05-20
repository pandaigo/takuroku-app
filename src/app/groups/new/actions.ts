'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'

// 卓/会を作成。owner は本人。
export async function createGroup(formData: FormData) {
  const uid = await getUserId()
  if (!uid) redirect('/login')

  const name = String(formData.get('name') ?? '').trim()
  const category = String(formData.get('category') ?? 'other')
  const systemName = String(formData.get('system_name') ?? '').trim()
  const startedOn = String(formData.get('started_on') ?? '').trim()
  const blurb = String(formData.get('blurb') ?? '').trim()
  const contactUrl = String(formData.get('contact_url') ?? '').trim()

  if (!name) {
    redirect('/groups/new?error=' + encodeURIComponent('卓名を入れてください'))
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('groups')
    .insert({
      owner_id: uid,
      name,
      category: ['trpg', 'mystery', 'werewolf', 'boardgame', 'other'].includes(
        category,
      )
        ? category
        : 'other',
      system_name: systemName || null,
      started_on: startedOn || null,
      blurb: blurb || null,
      contact_url: contactUrl || null,
    })
    .select('id')
    .single()

  if (error || !data) {
    redirect(
      '/groups/new?error=' + encodeURIComponent('作成に失敗しました'),
    )
  }
  redirect(`/groups/${data.id}`)
}
