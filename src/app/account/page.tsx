import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { changePassword, changeEmail, deleteAccount } from './actions'

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims) redirect('/login')
  const currentEmail =
    typeof claims.email === 'string' ? claims.email : '（不明）'

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-xl md:py-12">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← 卓一覧
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        アカウント
      </h1>

      {sp.message ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {sp.message}
        </p>
      ) : null}
      {sp.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {sp.error}
        </p>
      ) : null}

      {/* 現在のメール + UID */}
      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          ログイン中のメール
        </p>
        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {currentEmail}
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          あなたのユーザーID（管理者設定等に使う識別子）
        </p>
        <p className="mt-1 break-all rounded bg-zinc-50 px-2 py-1 text-xs font-mono text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {typeof claims.sub === 'string' ? claims.sub : '—'}
        </p>
      </section>

      {/* パスワード変更 */}
      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          パスワード変更
        </h2>
        <form action={changePassword} className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            新しいパスワード（8文字以上）
            <input
              type="password"
              name="new_password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <button className="self-start rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            パスワードを変更
          </button>
        </form>
      </section>

      {/* メールアドレス変更 */}
      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          メールアドレス変更
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          新アドレスに確認リンクを送ります。旧アドレスにも通知が届くので不正変更に気付けます。
        </p>
        <form action={changeEmail} className="mt-3 flex flex-col gap-3">
          <input
            type="email"
            name="new_email"
            required
            placeholder="新しいメールアドレス"
            autoComplete="email"
            spellCheck={false}
            inputMode="email"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button className="self-start rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900">
            変更リクエストを送る
          </button>
        </form>
      </section>

      {/* データエクスポート */}
      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          データのエクスポート
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          あなたの全データ（卓・メンバー・記録・公開リンク・イベント）を JSON
          で手元に保存できます。
        </p>
        <a
          href="/api/export"
          className="mt-3 inline-block rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          JSON でダウンロード
        </a>
      </section>

      {/* 退会 */}
      <section className="mt-6 rounded-lg border border-red-200 p-4 dark:border-red-900">
        <h2 className="text-sm font-medium text-red-700 dark:text-red-300">
          退会（アカウント削除）
        </h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          すべての卓・メンバー・記録・公開リンクが
          <strong>連鎖削除</strong>されます。元に戻せません。
          続けるには確認欄に「<strong>削除</strong>」と入力してください。
        </p>
        <form action={deleteAccount} className="mt-3 flex flex-col gap-3">
          <input
            name="confirm"
            required
            placeholder="削除"
            className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-500 dark:border-red-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button className="self-start rounded-full border border-red-300 bg-red-50 px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900">
            退会する
          </button>
        </form>
      </section>
    </main>
  )
}
