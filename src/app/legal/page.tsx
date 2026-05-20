import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約・プライバシー｜卓録',
}

export default function LegalIndex() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← 卓録トップへ
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        利用規約・プライバシー・サポート
      </h1>
      <ul className="mt-4 flex flex-col gap-2">
        <li>
          <Link
            href="/legal/terms"
            className="text-sm text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            利用規約
          </Link>
        </li>
        <li>
          <Link
            href="/legal/privacy"
            className="text-sm text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            プライバシーポリシー
          </Link>
        </li>
        <li>
          <Link
            href="/legal/contact"
            className="text-sm text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            問い合わせ窓口
          </Link>
        </li>
        <li>
          <Link
            href="/legal/complaint"
            className="text-sm text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            通報・異議申立
          </Link>
        </li>
        <li>
          <Link
            href="/legal/status"
            className="text-sm text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            稼働状況・障害告知
          </Link>
        </li>
      </ul>
    </main>
  )
}
