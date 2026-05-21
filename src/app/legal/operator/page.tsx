import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '運営者情報',
  description:
    '卓録の運営者・連絡先・サービス内容の表記。',
}

export default function OperatorPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <nav className="text-sm text-[var(--ink-2)]">
        <Link href="/" className="hover:text-[var(--ink)]">
          卓録トップ
        </Link>
        <span className="mx-2 text-[var(--rule)]">／</span>
        <Link href="/legal" className="hover:text-[var(--ink)]">
          法務
        </Link>
        <span className="mx-2 text-[var(--rule)]">／</span>
        <span className="text-[var(--ink-3)]">運営者情報</span>
      </nav>
      <h1 className="mt-4 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        運営者情報
      </h1>
      <p className="mt-2 text-xs text-[var(--ink-3)]">
        最終更新日：2026-05-20
      </p>

      <dl className="mt-6 divide-y divide-[var(--rule)] border-y border-[var(--rule-strong)]">
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm font-medium text-[var(--ink-2)]">
            サービス名
          </dt>
          <dd className="text-sm text-[var(--ink)]">卓録（たくろく）</dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm font-medium text-[var(--ink-2)]">
            運営者
          </dt>
          <dd className="text-sm text-[var(--ink)]">
            microforge.hq（個人開発）
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm font-medium text-[var(--ink-2)]">
            連絡先メール
          </dt>
          <dd className="text-sm text-[var(--ink)]">
            <a
              href="mailto:microforge.hq@gmail.com"
              className="border-b border-[var(--vermilion)] text-[var(--vermilion)] hover:text-[var(--vermilion-deep)]"
            >
              microforge.hq@gmail.com
            </a>
            <span className="ml-2 text-xs text-[var(--ink-3)]">
              （平日 3 営業日以内に返信）
            </span>
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm font-medium text-[var(--ink-2)]">
            所在地・電話番号
          </dt>
          <dd className="text-sm text-[var(--ink)]">
            個人開発のため非公開。法令に基づく開示請求があった場合は遅滞なく開示します。
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm font-medium text-[var(--ink-2)]">
            サービス内容
          </dt>
          <dd className="text-sm leading-relaxed text-[var(--ink)]">
            TRPG卓・マダミス卓・人狼会・ボドゲ会等の継続記録と、卓年鑑カードの生成・共有を提供する Web アプリ。
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm font-medium text-[var(--ink-2)]">
            料金
          </dt>
          <dd className="text-sm text-[var(--ink)]">
            現在無料で提供しています（一部機能の有料化を将来検討する可能性あり。実施前に告知します）。
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-sm font-medium text-[var(--ink-2)]">
            サービス開始
          </dt>
          <dd className="text-sm text-[var(--ink)]">2026年5月</dd>
        </div>
      </dl>

      <section className="mt-8 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-4 py-3 text-sm text-[var(--ink)]">
        <p className="font-[family-name:var(--font-mincho)] font-semibold tracking-[0.1em] text-[var(--brass)]">
          ── 個人開発であることのご了承
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--ink-2)]">
          卓録は個人開発のサービスで、応答時間や復旧速度は法人運営のものと比べて遅い場合があります。それでも誠実に対応します。要望・不具合は上記メール、または
          <Link href="/legal/contact" className="ml-1 underline">問い合わせ窓口</Link>
          までお寄せください。
        </p>
      </section>
    </main>
  )
}
