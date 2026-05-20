import { TONE, KIND_LABEL } from '@/lib/genre'

export type CardHighlight = {
  title: string
  note: string
  spoiler?: boolean
}

export type CardPresenterProps = {
  category: string
  groupName: string
  systemName?: string | null
  stats: [
    { value: string; label: string },
    { value: string; label: string },
    { value: string; label: string },
  ]
  // 種別別の補助指標（例：完走シナリオ8本 / 遊んだゲーム92タイトル）。null/空 で非表示。
  supplementary?: string | null
  // メンバー欄に表示する文字列（事前に "名前（回数）・..." 形式で整えてもらう）
  members: string
  highlights?: CardHighlight[]
  rankLabel: string
  // 右下表示：「最終開催 2025-05-09」または「卓録」など
  footerRight: string
  blurb?: string | null
  recruitLine?: string
}

// 卓年鑑カード：紙地＋墨字＋角印の和の年鑑帳トーン。
// card/[token]/demo の3経路から共用。
export function CardPresenter({
  category,
  groupName,
  systemName,
  stats,
  supplementary,
  members,
  highlights,
  rankLabel,
  footerRight,
  blurb,
  recruitLine = '一緒に遊ぶ人募集中',
}: CardPresenterProps) {
  const tone = TONE[category] ?? TONE.other
  const kindLabel = KIND_LABEL[category] ?? category

  return (
    <article className="border-2 border-[var(--ink)] bg-[var(--paper)] p-6 text-[var(--ink)] shadow-[3px_3px_0_0_var(--paper-edge)]">
      {/* 上部：年鑑タイトル＋カテゴリ角印 */}
      <header className="flex items-start justify-between gap-4 border-b border-[var(--rule-strong)] pb-3">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-mincho)] text-[10px] tracking-[0.5em] text-[var(--ink-2)]">
            卓 年 鑑
          </p>
          <h1 className="mt-1 truncate text-2xl font-semibold text-[var(--ink)]">
            {groupName}
          </h1>
          <p className="mt-0.5 text-xs text-[var(--ink-2)]">
            {kindLabel}
            {systemName ? `／${systemName}` : ''}
          </p>
        </div>
        <span
          className="stamp-sq h-12 w-12 shrink-0 text-lg"
          style={{ borderColor: tone.hex, color: tone.hex }}
          aria-label={kindLabel}
        >
          {tone.mark}
        </span>
      </header>

      {/* 3列縦罫：通算 / 継続 / ペース */}
      <div className="mt-4 grid grid-cols-3 divide-x divide-[var(--rule)] text-center">
        {stats.map((s, i) => (
          <div key={i} className="px-2">
            <p className="tabular font-[family-name:var(--font-mincho)] text-2xl font-semibold leading-tight">
              {s.value}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-[var(--ink-2)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {supplementary ? (
        <p className="mt-3 border-t border-dotted border-[var(--rule)] pt-2 text-center text-sm text-[var(--ink-2)]">
          {supplementary}
        </p>
      ) : null}

      {/* 同卓者 */}
      <section className="mt-4 border-t border-[var(--rule)] pt-3">
        <p className="text-[10px] tracking-[0.3em] text-[var(--ink-2)]">
          同 卓 者
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
          {members}
        </p>
      </section>

      {/* 名場面 */}
      {highlights && highlights.length > 0 ? (
        <section className="mt-4 border-t border-[var(--rule)] pt-3">
          <p className="text-[10px] tracking-[0.3em] text-[var(--ink-2)]">
            名 場 面
          </p>
          <ul className="chapter-list mt-2 flex flex-col gap-1.5 text-sm text-[var(--ink)]">
            {highlights.map((h, i) =>
              h.spoiler ? (
                <li key={i}>
                  <details className="inline">
                    <summary
                      className="cursor-pointer text-[var(--vermilion)] underline-offset-2 hover:underline"
                      style={{ display: 'inline' }}
                    >
                      ネタバレあり（タップで表示）
                    </summary>
                    <span className="ml-1">
                      「{h.note}」
                      <span className="text-[var(--ink-2)]">― {h.title}</span>
                    </span>
                  </details>
                </li>
              ) : (
                <li key={i}>
                  「{h.note}」
                  <span className="text-[var(--ink-2)]">― {h.title}</span>
                </li>
              ),
            )}
          </ul>
        </section>
      ) : null}

      {/* 称号印鑑＋最終開催 */}
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-double border-[var(--rule-strong)] pt-3">
        <span className="stamp-rank text-xs">
          {rankLabel}
        </span>
        <span className="text-[10px] tracking-wider text-[var(--ink-2)]">
          {footerRight}
        </span>
      </footer>

      {blurb ? (
        <p className="mt-4 border-t border-dotted border-[var(--rule)] pt-3 text-sm leading-relaxed text-[var(--ink)]">
          {blurb}
          <span className="mt-1 block text-xs text-[var(--ink-2)]">
            {recruitLine}
          </span>
        </p>
      ) : null}
    </article>
  )
}
