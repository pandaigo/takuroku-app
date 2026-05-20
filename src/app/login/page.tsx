import Link from 'next/link'
import type { Metadata } from 'next'
import { signIn, signUp, signInWithGoogle } from './actions'
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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8 md:max-w-xl md:py-12">
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
          <p className="tabular text-2xl font-semibold leading-none">
            5
          </p>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-[var(--ink-2)]">
            対 応 種 別
          </p>
        </div>
        <div className="px-1">
          <p className="tabular text-2xl font-semibold leading-none">
            数十秒
          </p>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-[var(--ink-2)]">
            1 記 録
          </p>
        </div>
        <div className="px-1">
          <p className="tabular text-2xl font-semibold leading-none">
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

      {/* 種別ごとの配慮（ペルソナレビュー A-6/7/8 対応） */}
      <section className="mt-7 border border-[var(--rule-strong)] bg-[var(--paper)] p-4">
        <p className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink)]">
          ── 種 別 ご と の 配 慮
        </p>
        <dl className="mt-3 space-y-2.5 text-xs leading-relaxed">
          <div>
            <dt className="font-semibold text-[var(--ink)]">マダミス卓</dt>
            <dd className="mt-0.5 text-[var(--ink-2)]">
              名場面は<strong className="text-[var(--ink)]">ネタバレ折りたたみ</strong>で投稿可能（公開URL閲覧者にもクリック必須）。公開URL発行前に<strong className="text-[var(--ink)]">プレビュー</strong>で内容を確認・編集できます。シナリオ名を伏せたい場合は仮名や番号で記録。覆面プレイヤー保護は規約に明記。
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">人狼会</dt>
            <dd className="mt-0.5 text-[var(--ink-2)]">
              10〜20名の多人数でも、<strong className="text-[var(--ink)]">前回参加者の一括選択</strong>で1回数十秒で記録。村種別（初心者村/常連村等）はタイトルで自由に区別。役職別の細かい記録は将来対応。
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">ボドゲ会</dt>
            <dd className="mt-0.5 text-[var(--ink-2)]">
              1セッションで複数ゲーム遊んでも、タイトル欄に「カタン・宝石」のように<strong className="text-[var(--ink)]">中黒で並べて記録</strong>。<strong className="text-[var(--ink)]">ユニークなゲーム数を自動集計</strong>。
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">TRPG卓</dt>
            <dd className="mt-0.5 text-[var(--ink-2)]">
              シナリオ・KP/PL役割・キャンペーン継続を記録。複数シナリオの並行記録、PL別の出席カウントに対応。
            </dd>
          </div>
        </dl>
      </section>

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

        {/* Google OAuth（ペルソナレビュー A-2 対応） */}
        <form className="mt-3 flex flex-col gap-2">
          <button
            formAction={signInWithGoogle}
            className="flex w-full items-center justify-center gap-2 border-2 border-[var(--rule-strong)] bg-[var(--paper)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--paper-2)]"
          >
            {/* Google ロゴ：SVG inline で /public 不要 */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              aria-hidden
            >
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Google で続ける
          </button>
          <div className="my-2 flex items-center gap-3 text-[10px] tracking-[0.3em] text-[var(--ink-3)]">
            <span className="h-px flex-1 bg-[var(--rule)]" aria-hidden />
            または
            <span className="h-px flex-1 bg-[var(--rule)]" aria-hidden />
          </div>
        </form>

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
