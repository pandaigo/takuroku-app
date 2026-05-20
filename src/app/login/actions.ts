'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Google OAuth（ペルソナレビュー A-2 対応：5/6 ペルソナが email+password のみを致命的と指摘）。
// Supabase Dashboard で Google provider を有効化＋Client ID/Secret 設定が前提。
export async function signInWithGoogle() {
  const supabase = await createClient()
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })
  if (error) {
    redirect(
      '/login?error=' +
        encodeURIComponent('Googleログインに失敗しました：' + error.message),
    )
  }
  if (data?.url) {
    redirect(data.url)
  }
  redirect('/login?error=' + encodeURIComponent('OAuth URL を取得できませんでした'))
}

// ログイン。失敗したら理由を付けて /login に戻す。
export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect(
      '/login?error=' +
        encodeURIComponent('メールアドレスかパスワードが違います'),
    )
  }
  redirect('/')
}

// 新規登録：13歳未満不可・13-17歳は保護者同意必須（D11/D22）。
export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const birthYearRaw = String(formData.get('birth_year') ?? '')
  const parentalConsent = formData.get('parental_consent') === 'on'

  if (password.length < 8) {
    redirect(
      '/login?error=' +
        encodeURIComponent('パスワードは8文字以上にしてください'),
    )
  }

  const birthYear = parseInt(birthYearRaw, 10)
  const currentYear = new Date().getFullYear()
  if (
    !Number.isInteger(birthYear) ||
    birthYear < 1900 ||
    birthYear > currentYear
  ) {
    redirect(
      '/login?error=' +
        encodeURIComponent('生年（西暦4桁）を正しく入れてください'),
    )
  }
  const approxAge = currentYear - birthYear
  if (approxAge < 13) {
    redirect(
      '/login?error=' + encodeURIComponent('13歳未満はご利用いただけません'),
    )
  }
  if (approxAge < 18 && !parentalConsent) {
    redirect(
      '/login?error=' +
        encodeURIComponent(
          '未成年（13-17歳）の方は保護者の同意確認のチェックが必要です',
        ),
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // プロフィールに年齢情報を保存（プロフィール本体はトリガで自動作成済み）
  const userId = data.user?.id
  if (userId) {
    await supabase
      .from('profiles')
      .update({
        birth_year: birthYear,
        parental_consent_at:
          approxAge < 18 ? new Date().toISOString() : null,
      })
      .eq('id', userId)
  }

  // メール確認が無効ならこのまま入れる。
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError) {
    redirect(
      '/login?message=' +
        encodeURIComponent(
          '確認メールを送りました。メール内のリンクを開いてからログインしてください',
        ),
    )
  }
  redirect('/')
}
