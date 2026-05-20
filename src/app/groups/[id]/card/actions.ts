'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/auth'

// 「共有・勧誘に使った」を記録（撤退ライン②の計測シグナル）。
export async function markCardShared(formData: FormData) {
  const uid = await getUserId()
  const groupId = String(formData.get('group_id') ?? '')
  if (!uid || !groupId) redirect(`/groups/${groupId}/card`)

  const supabase = await createClient()
  await supabase.from('events').insert({
    user_id: uid,
    group_id: groupId,
    type: 'card_shared',
  })
  redirect(`/groups/${groupId}/card?shared=1`)
}
