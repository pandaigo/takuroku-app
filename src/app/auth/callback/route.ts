import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Supabase OAuth コールバック。Google など provider から戻ってきた code を session に交換。
// 失敗時は理由付きで /login に redirect。
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('認証コードがありません')}`,
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('認証に失敗しました：' + error.message)}`,
    )
  }
  return NextResponse.redirect(`${origin}${next}`)
}
