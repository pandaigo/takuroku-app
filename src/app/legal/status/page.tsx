import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '稼働状況・障害告知｜卓録',
}

export default function StatusPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-2xl md:py-12">
      <Link
        href="/legal"
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← 法務トップへ
      </Link>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        稼働状況・障害告知
      </h1>

      <section className="mt-6 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] p-4">
        <p className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.1em] text-[var(--brass)]">
          ── 現在の状況：正常稼働中
        </p>
        <p className="mt-2 text-xs text-[var(--ink-2)]">
          障害発生時は検知後24時間以内に第1報を本ページに掲載します。
        </p>
      </section>

      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          運営者の長期不在の予定
        </h2>
        <p className="mt-3 text-sm text-[var(--ink-2)]">
          現在予定なし。7日以上の不在となる場合は、事前に本ページで告知します。不在期間中、問い合わせ・削除請求への応答が遅延することがあります。
        </p>
      </section>

      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          過去の障害・告知
        </h2>
        <p className="mt-3 text-sm text-[var(--ink-3)]">
          記録されている事案はありません。
        </p>
      </section>
    </main>
  )
}
