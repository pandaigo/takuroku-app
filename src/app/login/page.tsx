import Link from 'next/link'
import type { Metadata } from 'next'
import { signIn, signUp } from './actions'
import { CardPresenter } from '@/components/card-presenter'
import { TONE, KIND_LABEL, getCardStats, periodLabel } from '@/lib/genre'

// /login は事実上のLP。検索意図に応えるtitle/descriptionを独自に。
export const metadata: Metadata = {
  title: '卓・ボドゲ会の記録を1枚の年鑑カードに｜卓録',
  description:
    'TRPG卓・マダミス卓・人狼会・ボドゲ会の「誰と・どれだけ続けたか」を記録し、卓年鑑カードで勧誘・共有。1回数十秒の入力で続けるほど価値が積み上がる、非AIの記録アプリ。',
  openGraph: {
    title: '卓・ボドゲ会の記録を1枚の年鑑カードに｜卓録',
    description:
      '続けてきた卓・会の歴史を1枚のカードに。TRPG・マダミス・人狼・ボドゲ会対応。',
    type: 'website',
  },
  alternates: {
    canonical: '/login',
  },
}

const KIND_LIST = ['trpg', 'mystery', 'werewolf', 'boardgame', 'other'] as const

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const sp = await searchParams
  const thisYear = new Date().getFullYear()

  // 表紙に置く見本：金曜クトゥルフ卓（demoと同じデータ系を縮約）
  const sampleStats = getCardStats('trpg', {
    total: 28,
    isEmpty: false,
    periodLabel: periodLabel(16),
    pace: '1.8',
  })

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      {/* 表紙ヘッダ */}
      <div className="border-b-2 border-double border-[var(--rule-strong)] pb-4 text-center">
        <span className="stamp-sq mx-auto h-12 w-12 text-lg" aria-hidden>
          卓
        </span>
        <h1
          translate="no"
          className="mt-3 font-[family-name:var(--font-mincho)] text-4xl font-semibold tracking-[0.5em] text-[var(--ink)]"
        >
          卓 録
        </h1>
        <p
          translate="no"
          className="mt-1 text-[10px] uppercase tracking-[0.5em] text-[var(--ink-3)]"
        >
          takuroku
        </p>
        <p className="mt-3 text-sm text-[var(--ink-2)]">
          卓 ・ 会 の 年 鑑 帳
        </p>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-[var(--ink)]">
        TRPG卓・マダミス卓・人狼会・ボドゲ会などの
        「誰と・どれだけ続けたか」を残す、紙の年鑑帳のような記録アプリ。
      </p>

      {/* 差別化コピー：Discord/CCFOLIA との関係を明確化 */}
      <div className="mt-4 border-l-2 border-[var(--vermilion)] bg-[rgba(168,50,45,0.04)] py-2 pl-3 pr-2 text-xs leading-relaxed text-[var(--ink-2)]">
        <p>
          <span className="text-[var(--ink-3)]">Discord は</span>
          ログが流れる。
          <span className="text-[var(--ink-3)] ml-2">CCFOLIA は</span>
          1卓1セッションの記録。
        </p>
        <p className="mt-0.5 font-[family-name:var(--font-mincho)] font-semibold text-[var(--ink)]">
          卓録は <span className="text-[var(--vermilion)]">卓そのもの</span>の歴史を、1枚のカードに。
        </p>
        <p className="mt-0.5 text-[var(--ink-3)]">
          過去の履歴も CSV でまとめて取り込めます。
        </p>
      </div>

      {/* 5種別の角印 */}
      <div className="mt-5 flex flex-wrap items-center justify-start gap-2">
        {KIND_LIST.map((k) => {
          const t = TONE[k]
          return (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 border bg-[var(--paper)] px-2.5 py-1 text-xs"
              style={{ borderColor: t.hex, color: t.hex }}
            >
              <span className="font-[family-name:var(--font-mincho)] font-semibold">
                {t.mark}
              </span>
              <span className="text-[var(--ink-2)]">{KIND_LABEL[k]}</span>
            </span>
          )
        })}
      </div>

      {/* 3列縦罫 */}
      <div className="mt-6 grid grid-cols-3 divide-x divide-[var(--rule)] border border-[var(--rule-strong)] py-3 text-center">
        <div className="px-1">
          <p className="tabular font-[family-name:var(--font-mincho)] text-2xl font-semibold leading-none">
            5
          </p>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-[var(--ink-2)]">
            対 応 種 別
          </p>
        </div>
        <div className="px-1">
          <p className="tabular font-[family-name:var(--font-mincho)] text-2xl font-semibold leading-none">
            数十秒
          </p>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-[var(--ink-2)]">
            1 記 録
          </p>
        </div>
        <div className="px-1">
          <p className="tabular font-[family-name:var(--font-mincho)] text-2xl font-semibold leading-none">
            1 枚
          </p>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-[var(--ink-2)]">
            年 鑑 カ ー ド
          </p>
        </div>
      </div>

      {/* 機能要点：「一、二、」 */}
      <ul className="chapter-list mt-5 space-y-1 pl-2 text-xs leading-relaxed text-[var(--ink-2)]">
        <li>1回の記録は数十秒（前回の出席者は最初から選択済み）</li>
        <li>続けるほど「顔」になる卓年鑑カード</li>
        <li>公開URLとスクショで勧誘・共有</li>
      </ul>

      {/* サンプル年鑑カード */}
      <p className="mt-7 text-[10px] tracking-[0.3em] text-[var(--ink-3)]">
        ── 見 本 ──
      </p>
      <div className="mt-2">
        <CardPresenter
          category="trpg"
          groupName="金曜クトゥルフ卓"
          systemName="クトゥルフ神話TRPG"
          stats={sampleStats}
          members="あおい・はる・なつ・ふゆ・Sho"
          rankLabel="歴 戦"
          footerRight="最終開催 2025-05-09"
        />
      </div>
      <p className="mt-3 text-center text-xs">
        <Link
          href="/demo"
          className="border-b border-[var(--vermilion)] text-[var(--vermilion)] hover:text-[var(--vermilion-deep)]"
        >
          他の種別も見る（マダミス・人狼・ボドゲ）
        </Link>
      </p>

      {/* フォーム */}
      <div className="mt-10 border-2 border-[var(--ink)] bg-[var(--paper)] p-5">
        <p className="text-[10px] tracking-[0.3em] text-[var(--ink-2)]">
          受 付
        </p>
        {sp.error ? (
          <p className="mt-3 border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-sm text-[var(--vermilion-deep)]">
            {sp.error}
          </p>
        ) : null}
        {sp.message ? (
          <p className="mt-3 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-sm text-[var(--brass)]">
            {sp.message}
          </p>
        ) : null}

        <form className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
            メールアドレス
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              inputMode="email"
              className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
            パスワード（8文字以上）
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              spellCheck={false}
              className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
          </label>

          <details className="border border-[var(--rule)] px-3 py-2 text-xs text-[var(--ink-2)]">
            <summary className="cursor-pointer">
              新規登録される方はこちら（年齢確認）
            </summary>
            <label className="mt-2 flex flex-col gap-1">
              生年（西暦4桁・13歳未満不可）
              <input
                name="birth_year"
                type="number"
                min={1900}
                max={thisYear}
                placeholder={`例 ${thisYear - 25}`}
                className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
              />
            </label>
            <label className="mt-2 flex items-start gap-2">
              <input
                type="checkbox"
                name="parental_consent"
                className="mt-0.5"
              />
              <span>
                18歳未満の場合：保護者の同意を得てから登録します。
              </span>
            </label>
          </details>

          <div className="mt-2 flex gap-3">
            <button
              formAction={signIn}
              className="flex-1 border-2 border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-sm font-medium tracking-[0.15em] text-[var(--paper)] transition-colors hover:bg-[var(--ink-2)]"
            >
              入 室
            </button>
            <button
              formAction={signUp}
              className="flex-1 border-2 border-[var(--vermilion)] bg-[var(--paper)] px-4 py-2 text-sm font-medium tracking-[0.15em] text-[var(--vermilion)] transition-colors hover:bg-[rgba(168,50,45,0.06)]"
            >
              新 規 開 帳
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
