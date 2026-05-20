import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '稼働状況・障害告知｜卓録',
}

export default function StatusPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <Link
        href="/legal"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← 法務トップへ
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        稼働状況・障害告知
      </h1>

      <section className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          現在の状況：正常稼働中
        </p>
        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
          障害発生時は検知後24時間以内に第1報を本ページに掲載します。
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          運営者の長期不在の予定
        </h2>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          現在予定なし。7日以上の不在となる場合は、事前に本ページで告知します。不在期間中、問い合わせ・削除請求への応答が遅延することがあります。
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          過去の障害・告知
        </h2>
        <p className="mt-2 text-xs text-zinc-500">
          記録されている事案はありません。
        </p>
      </section>
    </main>
  )
}
