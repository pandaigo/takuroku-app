import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  changePassword,
  changeEmail,
  deleteAccount,
  updateMonthlyReportPref,
} from './actions'

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
  const uid = typeof claims.sub === 'string' ? claims.sub : null
  const { data: profile } = uid
    ? await supabase
        .from('profiles')
        .select('monthly_report_enabled')
        .eq('id', uid)
        .maybeSingle()
    : { data: null }
  const monthlyEnabled = profile?.monthly_report_enabled ?? true

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-xl md:py-12">
      <Link
        href="/"
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← 卓一覧
      </Link>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        手 帳
      </h1>

      {sp.message ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-sm text-[var(--brass)]"
        >
          {sp.message}
        </p>
      ) : null}
      {sp.error ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-sm text-[var(--vermilion-deep)]"
        >
          {sp.error}
        </p>
      ) : null}

      {/* 現在のメール + UID */}
      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <p className="text-xs text-[var(--ink-2)]">ログイン中のメール</p>
        <p className="mt-1 text-sm font-medium text-[var(--ink)]">
          {currentEmail}
        </p>
        <p className="mt-3 text-[10px] tracking-[0.2em] text-[var(--ink-3)]">
          あなたのユーザーID（管理者設定等に使う識別子）
        </p>
        <p className="mt-1 break-all border border-[var(--rule)] bg-[var(--paper-2)] px-2 py-1 font-mono text-xs text-[var(--ink)]">
          {typeof claims.sub === 'string' ? claims.sub : '—'}
        </p>
      </section>

      {/* パスワード変更 */}
      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          パスワード変更
        </h2>
        <form action={changePassword} className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
            新しいパスワード（8文字以上）
            <input
              type="password"
              name="new_password"
              required
              minLength={8}
              autoComplete="new-password"
              spellCheck={false}
              className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
          </label>
          <button className="self-start border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium tracking-[0.15em] text-[var(--paper)] hover:bg-[var(--ink-2)]">
            パスワードを変更
          </button>
        </form>
      </section>

      {/* メールアドレス変更 */}
      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          メールアドレス変更
        </h2>
        <p className="mt-2 text-xs text-[var(--ink-2)]">
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
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
          <button className="self-start border-2 border-[var(--ink)] bg-[var(--paper)] px-5 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]">
            変更リクエストを送る
          </button>
        </form>
      </section>

      {/* 月次レポートメール（Pro #5） */}
      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          月次レポートメール
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--ink-2)]">
          毎月 1 日に「先月の卓統計（卓数・通算開催・同卓者・シナリオ・MVP）」を登録メールにお届けします。配信を止めたい場合は OFF に。
        </p>
        <form action={updateMonthlyReportPref} className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              name="monthly_report_enabled"
              defaultChecked={monthlyEnabled}
            />
            <span>毎月のレポートを受け取る</span>
          </label>
          <button className="border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]">
            保存
          </button>
        </form>
      </section>

      {/* データエクスポート */}
      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          データのエクスポート
        </h2>
        <p className="mt-2 text-xs text-[var(--ink-2)]">
          あなたの全データ（卓・メンバー・記録・公開リンク・イベント）を JSON
          で手元に保存できます。
        </p>
        <a
          href="/api/export"
          className="mt-3 inline-block border-2 border-[var(--ink)] bg-[var(--paper)] px-5 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]"
        >
          JSON でダウンロード
        </a>
      </section>

      {/* 退会 */}
      <section className="mt-6 border-2 border-[var(--vermilion)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--vermilion)]">
          退会（アカウント削除）
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--ink-2)]">
          すべての卓・メンバー・記録・公開リンクが
          <strong className="text-[var(--vermilion-deep)]">連鎖削除</strong>
          されます。元に戻せません。続けるには確認欄に「
          <strong className="text-[var(--ink)]">削除</strong>
          」と入力してください。
        </p>
        <form action={deleteAccount} className="mt-3 flex flex-col gap-3">
          <input
            name="confirm"
            required
            placeholder="削除"
            className="border border-[var(--vermilion)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--vermilion-deep)]"
          />
          <button className="self-start border-2 border-[var(--vermilion)] bg-[rgba(168,50,45,0.06)] px-5 py-2 text-sm font-medium text-[var(--vermilion-deep)] hover:bg-[rgba(168,50,45,0.12)]">
            退会する
          </button>
        </form>
      </section>
    </main>
  )
}
