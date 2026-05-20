import { createBrowserClient } from '@supabase/ssr'

// ブラウザ（クライアントコンポーネント）用の Supabase クライアント。
// 公開鍵（publishable key）はブラウザに露出して問題ない設計。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
