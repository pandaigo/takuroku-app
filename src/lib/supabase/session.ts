import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// proxy（Next.js 16 で middleware から改称）から呼ぶセッション更新処理。
// createServerClient と getClaims() の間にコードを挟まないこと
// （ユーザーがランダムにログアウトされる不具合の原因になる）。
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          )
        },
      },
    },
  )

  // getClaims() は JWT 署名を公開鍵で検証する。getSession() はサーバで信頼してはいけない。
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/c/') &&
    !request.nextUrl.pathname.startsWith('/legal/') &&
    !request.nextUrl.pathname.startsWith('/legal') &&
    !request.nextUrl.pathname.startsWith('/demo') &&
    !request.nextUrl.pathname.startsWith('/opengraph-image') &&
    !request.nextUrl.pathname.startsWith('/sitemap.xml') &&
    !request.nextUrl.pathname.startsWith('/robots.txt')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // supabaseResponse はそのまま返すこと（cookie を改変するとセッションが壊れる）。
  return supabaseResponse
}
