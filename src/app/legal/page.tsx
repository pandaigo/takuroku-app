import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約・プライバシー',
}

const ITEMS: { href: string; label: string; desc: string }[] = [
  {
    href: '/legal/operator',
    label: '運営者情報',
    desc: 'サービス運営者・連絡先・料金',
  },
  {
    href: '/legal/terms',
    label: '利用規約',
    desc: 'ご利用にあたっての条件',
  },
  {
    href: '/legal/privacy',
    label: 'プライバシーポリシー',
    desc: '個人情報の取り扱い',
  },
  {
    href: '/legal/contact',
    label: '問い合わせ窓口',
    desc: '質問・不具合報告・データ削除請求',
  },
  {
    href: '/legal/complaint',
    label: '通報・異議申立',
    desc: 'なりすまし・嫌がらせ・プライバシー侵害等',
  },
  {
    href: '/legal/status',
    label: '稼働状況・障害告知',
    desc: 'サービス稼働情報',
  },
]

export default function LegalIndex() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-2xl md:py-12">
      <nav className="text-sm text-[var(--ink-2)]">
        <Link href="/" className="hover:text-[var(--ink)]">
          卓録トップ
        </Link>
        <span className="mx-2 text-[var(--rule)]">／</span>
        <span className="text-[var(--ink-3)]">法務</span>
      </nav>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        利用規約・プライバシー・サポート
      </h1>

      <ul className="mt-6 divide-y divide-[var(--rule)] border-y border-[var(--rule-strong)]">
        {ITEMS.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="flex items-baseline justify-between gap-3 px-1 py-3 hover:bg-[var(--paper-2)]"
            >
              <span className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.1em] text-[var(--ink)]">
                {it.label}
              </span>
              <span className="text-xs text-[var(--ink-3)]">{it.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
