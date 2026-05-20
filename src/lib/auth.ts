import { createClient } from '@/lib/supabase/server'

// 現在ログイン中のユーザーID（JWT の sub）。
// getClaims を使う（getSession はサーバで信頼しない＝土台の方針）。
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const sub = data?.claims?.sub
  return typeof sub === 'string' ? sub : null
}
