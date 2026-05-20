import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  KIND_LABEL,
  COMPLETED_LABEL_BY_CATEGORY,
  countUniqueGames,
  getCardStats,
  monthsBetween,
  periodLabel,
  rank,
} from '@/lib/genre'
import { CardPresenter } from '@/components/card-presenter'

type Member = { id: string; display_name: string }
type Session = {
  id: string
  played_on: string
  title: string
  note: string | null
  note_spoiler?: boolean
  status: string | null
  attendees: string[]
}
type CardData = {
  group: {
    id: string
    name: string
    category: string
    system_name: string | null
    started_on: string | null
    blurb: string | null
    contact_url: string | null
  }
  members: Member[]
  sessions: Session[]
  index_allowed: boolean
  last_played_on: string | null
}

// generateMetadata と本体で同じトークンを2回引かない（React.cache でリクエスト内重複排除）。
const fetchCard = cache(async (token: string): Promise<CardData | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_public_card', {
    p_token: token,
  })
  if (error || !data) return null
  return data as CardData
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const data = await fetchCard(token)
  if (!data) return { title: '卓録' }
  const total = data.sessions.length
  const kind = KIND_LABEL[data.group.category] ?? data.group.category
  return {
    title: `${data.group.name}｜卓録`,
    description: `${kind}・通算${total}回。続けている会の歴史。`,
    robots: data.index_allowed ? undefined : { index: false, follow: false },
    openGraph: {
      title: `${data.group.name}｜卓録`,
      description: `${kind}・通算${total}回。続けている会の歴史。`,
      type: 'website',
    },
  }
}

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data = await fetchCard(token)
  if (!data) notFound()

  const { group, members, sessions, last_played_on } = data
  const list = sessions
  const total = list.length
  const completed = list.filter((s) => s.status === 'cleared').length
  const isEmpty = total === 0
  const completedLabel = COMPLETED_LABEL_BY_CATEGORY[group.category] ?? null
  const isBoardgame = group.category === 'boardgame'
  const isMystery = group.category === 'mystery'
  const playedGames = isBoardgame
    ? countUniqueGames(list.map((s) => s.title ?? ''))
    : 0

  const memberName = new Map(members.map((m) => [m.id, m.display_name]))
  const counts = new Map<string, number>()
  for (const s of list) {
    for (const mid of s.attendees ?? []) {
      counts.set(mid, (counts.get(mid) ?? 0) + 1)
    }
  }
  const ranked = [...counts.entries()]
    .map(([mid, c]) => ({ name: memberName.get(mid) ?? '—', c }))
    .sort((a, b) => b.c - a.c)

  const dates = list.map((s) => s.played_on)
  const earliest =
    group.started_on ?? (dates.length ? dates[dates.length - 1] : null)
  const now = new Date()
  const from = earliest ? new Date(earliest) : now
  const months = monthsBetween(from, now)
  const pace = total > 0 ? (total / months).toFixed(1) : '0'

  const uniqueTitles = new Set(
    list.map((s) => s.title?.trim()).filter(Boolean),
  ).size
  const attendeeSum = list.reduce(
    (sum, s) => sum + (s.attendees?.length ?? 0),
    0,
  )

  const stats = getCardStats(group.category, {
    total,
    isEmpty,
    periodLabel: periodLabel(months),
    pace,
    uniqueTitles,
    attendeeSum,
  })

  // メンバー上位7名＋以降は省略表示（大人数卓で潰れない）
  const TOP_N = 7
  const rankedTop = ranked.slice(0, TOP_N)
  const rankedRest = ranked.length - rankedTop.length
  const membersText =
    ranked.length > 0
      ? rankedTop.map((r) => `${r.name}（${r.c}）`).join('・') +
        (rankedRest > 0 ? `…他${rankedRest}名` : '')
      : members.map((m) => m.display_name).join('・') || 'まだいません'

  let supplementary: string | null = null
  if (isBoardgame && playedGames > 0) {
    supplementary = `遊んだゲーム ${playedGames} タイトル`
  } else if (!isBoardgame && !isMystery && completedLabel && completed > 0) {
    supplementary = `${completedLabel} ${completed} 本`
  }

  const highlights = list
    .filter((s) => s.note)
    .slice(0, 3)
    .map((s) => ({
      title: s.title,
      note: s.note as string,
      spoiler: !!s.note_spoiler,
    }))

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <CardPresenter
        category={group.category}
        groupName={group.name}
        systemName={group.system_name}
        stats={stats}
        supplementary={supplementary}
        members={membersText}
        highlights={highlights}
        rankLabel={rank(total, months)}
        footerRight={last_played_on ? `最終開催 ${last_played_on}` : '卓録'}
        blurb={group.blurb}
      />

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
        {group.contact_url ? (
          <>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              この卓に参加したい方
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              主催が指定した連絡先からどうぞ。
            </p>
            <a
              href={group.contact_url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              参加希望はこちら
            </a>
            <p className="mt-3 border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
              あなたの卓・会も、こんな1枚にできます。
            </p>
            <Link
              href="/login"
              className="mt-2 inline-block text-xs underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              自分の卓を作る
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              あなたの卓・会も、こんな1枚にできます。
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              自分の卓を作る
            </Link>
          </>
        )}
      </div>

      {/* 掲載されている方への即時導線（ペルソナ「はる」の指摘対応） */}
      <section className="mt-6 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-4 py-3 text-xs">
        <p className="font-[family-name:var(--font-mincho)] font-semibold tracking-[0.1em] text-[var(--brass)]">
          ── このカードに自分の名前が載っている方へ
        </p>
        <p className="mt-1 text-[var(--ink-2)]">
          掲載拒否や名前の削除を希望される場合は、こちらから申請できます（ログイン不要・主催の許可不要）。緊急の事案は3営業日以内に対応します。
        </p>
        <Link
          href={`/legal/complaint?ref=${encodeURIComponent(`/c/${token}`)}&kind=member&reason=harassment`}
          className="mt-2 inline-block border border-[var(--vermilion)] bg-[var(--paper)] px-3 py-1.5 text-xs font-medium text-[var(--vermilion)] hover:bg-[rgba(168,50,45,0.06)]"
        >
          掲載拒否を申請する
        </Link>
      </section>

      <p className="mt-6 text-center text-xs text-zinc-400">
        <Link href="/" className="underline hover:text-zinc-600">
          卓録について
        </Link>
        <span className="mx-2">／</span>
        <Link
          href={`/legal/complaint?ref=${encodeURIComponent(`/c/${token}`)}`}
          className="underline hover:text-zinc-600"
        >
          内容を通報
        </Link>
      </p>
    </main>
  )
}
