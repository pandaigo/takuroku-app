import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '問い合わせ窓口｜卓録',
}

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-2xl md:py-12">
      <Link
        href="/legal"
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← 法務トップへ
      </Link>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        問い合わせ窓口
      </h1>

      <p className="mt-5 text-sm leading-relaxed text-[var(--ink-2)]">
        サービスへの質問・不具合報告・データの開示／訂正／削除請求などは、以下の経路でお願いします。
      </p>

      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          一般の問い合わせ
        </h2>
        <p className="mt-3 text-sm text-[var(--ink-2)]">
          運営者連絡先メール：
        </p>
        <a
          href="mailto:dg.fuji.1999@gmail.com"
          className="mt-1 inline-block break-all border-b border-[var(--vermilion)] text-sm text-[var(--vermilion)] hover:text-[var(--vermilion-deep)]"
        >
          dg.fuji.1999@gmail.com
        </a>
        <p className="mt-3 text-xs text-[var(--ink-3)]">
          応答目安：受領通知 5営業日以内／一次回答 10営業日以内。7日以上の不在となる場合は事前に告知します。
        </p>
      </section>

      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          通報・異議申立（メンバー本人・第三者を含む）
        </h2>
        <p className="mt-3 text-sm text-[var(--ink-2)]">
          なりすまし・嫌がらせ・実名の勝手な掲載・プライバシー侵害・名誉毀損・違法情報のご報告は、下のフォームでログイン無しに申立可能です。
        </p>
        <Link
          href="/legal/complaint"
          className="mt-3 inline-block border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]"
        >
          通報フォームへ
        </Link>
      </section>
    </main>
  )
}
