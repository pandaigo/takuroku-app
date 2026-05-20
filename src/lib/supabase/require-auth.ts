import { redirect } from 'next/navigation'
import { createClient } from './server'

// Server Component / Route Handler から呼ぶ。
// 未認証なら /login に redirect。proxy.ts を持たない環境（Cloudflare Workers 等）でも
// auth ガードを各 protected page で個別に保証するための薄いヘルパー。
export async function requireAuth() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    redirect('/login')
  }
  return data.claims
}
