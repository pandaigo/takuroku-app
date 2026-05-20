import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/session'

// Next.js 16: middleware は proxy に改称。app と同じ階層（src 直下）に置く。
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // 静的アセットと画像最適化を除く全ルートで実行（認証は全ルート推奨）
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
