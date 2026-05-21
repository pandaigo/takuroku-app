'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// パスワード変更（ログイン中の本人のみ）。
export async function changePassword(formData: FormData) {
  const newPassword = String(formData.get('new_password') ?? '')
  if (newPassword.length < 8) {
    redirect(
      '/account?error=' +
        encodeURIComponent('パスワードは8文字以上にしてください'),
    )
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    redirect('/account?error=' + encodeURIComponent(error.message))
  }
  revalidatePath('/account')
  redirect('/account?message=' + encodeURIComponent('パスワードを変更しました'))
}

// メールアドレス変更：新アドレスに確認メールが届き、本人確認後に切替。
// Supabase 既定で旧アドレスにも通知が届く（ロールバック可）。
export async function changeEmail(formData: FormData) {
  const newEmail = String(formData.get('new_email') ?? '').trim()
  if (!newEmail || !newEmail.includes('@')) {
    redirect(
      '/account?error=' +
        encodeURIComponent('正しいメールアドレスを入れてください'),
    )
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) {
    redirect('/account?error=' + encodeURIComponent(error.message))
  }
  redirect(
    '/account?message=' +
      encodeURIComponent(
        '新しいメールアドレスに確認リンクを送りました。受信箱を確認してください（旧アドレスにも通知が届きます）。',
      ),
  )
}

// 月次レポートメール配信 ON/OFF。Pro 機能 #5。
// profiles.monthly_report_enabled を toggle。
export async function updateMonthlyReportPref(formData: FormData) {
  const enabled = formData.get('monthly_report_enabled') === 'on'
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const uid =
    typeof authData?.claims?.sub === 'string' ? authData.claims.sub : null
  if (!uid) redirect('/login')
  const { error } = await supabase
    .from('profiles')
    .update({ monthly_report_enabled: enabled })
    .eq('id', uid)
  if (error) {
    redirect('/account?error=' + encodeURIComponent(error.message))
  }
  revalidatePath('/account')
  redirect(
    '/account?message=' +
      encodeURIComponent(
        enabled
          ? '月次レポートの配信を ON にしました'
          : '月次レポートの配信を OFF にしました',
      ),
  )
}

// 退会：本人確認のため「削除」と打ってもらう。連鎖削除で全データ消去。
export async function deleteAccount(formData: FormData) {
  const confirm = String(formData.get('confirm') ?? '')
  if (confirm !== '削除') {
    redirect(
      '/account?error=' +
        encodeURIComponent('確認欄に「削除」と入力してください'),
    )
  }
  const supabase = await createClient()
  const { error } = await supabase.rpc('delete_my_account')
  if (error) {
    redirect('/account?error=' + encodeURIComponent(error.message))
  }
  // セッションも明示破棄
  await supabase.auth.signOut()
  redirect('/login?message=' + encodeURIComponent('アカウントを削除しました'))
}
