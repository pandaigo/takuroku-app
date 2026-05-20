import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '問い合わせ窓口｜卓録',
}

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <Link
        href="/legal"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← 法務トップへ
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        問い合わせ窓口
      </h1>

      <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
        サービスへの質問・不具合報告・データの開示／訂正／削除請求・将来課金時の特商法に基づく請求は、以下の経路でお願いします。
      </p>

      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          一般の問い合わせ
        </h2>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          運営者連絡先メール（雛形・実運用前に確定）：
          <br />
          <code className="break-all rounded bg-zinc-50 px-2 py-1 dark:bg-zinc-950">
            takuroku-ops@example.com
          </code>
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          応答目安：受領通知 5営業日以内／一次回答 10営業日以内。
          7日以上の不在となる場合は事前に告知します。
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          通報・異議申立（メンバー本人・第三者を含む）
        </h2>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          なりすまし・嫌がらせ・実名の勝手な掲載・プライバシー侵害・名誉毀損・違法情報のご報告は、
          下のフォームでログイン無しに申立可能です。
        </p>
        <Link
          href="/legal/complaint"
          className="mt-3 inline-block rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          通報フォームへ
        </Link>
      </section>
    </main>
  )
}
