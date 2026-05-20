import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// サーバ（Server Component / Server Action / Route Handler）用のクライアント。
// Fluid Compute 環境ではグローバルに保持せず、リクエストごとに生成する。
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component から呼ばれた場合は書き込めない。
            // proxy 側でセッションを更新しているため無視してよい。
          }
        },
      },
    },
  )
}
