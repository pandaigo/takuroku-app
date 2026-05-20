'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// 管理者：通報のステータス更新（reviewing/resolved_remove/resolved_keep/dismissed）
export async function updateComplaintStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !status) redirect('/admin/complaints')

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_update_complaint', {
    p_id: id,
    p_status: status,
  })
  if (error) {
    redirect(
      '/admin/complaints?error=' +
        encodeURIComponent('更新に失敗しました：' + error.message),
    )
  }
  revalidatePath('/admin/complaints')
  redirect('/admin/complaints?updated=1')
}

// 管理者：公開URLを暫定停止（target_ref が /c/<token> 形式なら自動抽出。手入力もOK）
export async function suspendPublicLink(formData: FormData) {
  const tokenInput = String(formData.get('token') ?? '').trim()
  const complaintId = String(formData.get('complaint_id') ?? '')

  // /c/TOKEN または絶対URLからトークン抽出
  const m = tokenInput.match(/\/c\/([A-Za-z0-9_-]+)/)
  const token = m ? m[1] : tokenInput

  if (!token) {
    redirect(
      '/admin/complaints?error=' +
        encodeURIComponent('トークンが特定できません'),
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_suspend_link', {
    p_token: token,
  })
  if (error) {
    redirect(
      '/admin/complaints?error=' +
        encodeURIComponent('暫定停止失敗：' + error.message),
    )
  }
  // 通報側のステータスも suspended に
  if (complaintId) {
    await supabase.rpc('admin_update_complaint', {
      p_id: complaintId,
      p_status: 'suspended',
    })
  }
  revalidatePath('/admin/complaints')
  redirect('/admin/complaints?suspended=1')
}
