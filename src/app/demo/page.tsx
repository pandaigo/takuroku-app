import Link from 'next/link'
import type { Metadata } from 'next'
import {
  KIND_LABEL,
  COMPLETED_LABEL_BY_CATEGORY,
  getCardStats,
  periodLabel,
  rank,
} from '@/lib/genre'
import { CardPresenter } from '@/components/card-presenter'

export const metadata: Metadata = {
  title: 'デモ',
  description:
    '卓年鑑カードのデモ（架空の卓・本物のユーザーデータは含みません）',
  robots: { index: false, follow: false },
}

type Kind = 'trpg' | 'mystery' | 'werewolf' | 'boardgame'
const KIND_LIST: Kind[] = ['trpg', 'mystery', 'werewolf', 'boardgame']

type SampleData = {
  groupName: string
  systemName: string | null
  startedOn: string
  blurb: string
  contactUrl: string
  lastPlayedOn: string
  total: number
  completed: number
  months: number
  uniqueTitles?: number
  attendeeSum?: number
  playedGames?: number
  ranked: { name: string; c: number }[]
  highlights: { title: string; note: string; spoiler?: boolean }[]
}

const SAMPLES: Record<Kind, SampleData> = {
  trpg: {
    groupName: '金曜クトゥルフ卓',
    systemName: 'クトゥルフ神話TRPG（7版）',
    startedOn: '2024-01-15',
    blurb: '月2ペース、初心者歓迎、長編好み。新メンバー随時募集中。',
    contactUrl: 'https://twitter.com/example_kp',
    lastPlayedOn: '2025-05-09',
    total: 28,
    completed: 8,
    months: 16,
    ranked: [
      { name: 'あおい（KP）', c: 28 },
      { name: 'はる', c: 26 },
      { name: 'なつ', c: 24 },
      { name: 'ふゆ', c: 22 },
      { name: 'Sho（ゲスト）', c: 6 },
    ],
    highlights: [
      { title: '禁断の医学', note: '探索者全員が屋根裏から逃げ切れた瞬間' },
      { title: '獄門の館', note: 'ふゆの探索者が獄門で死亡。全員で黙祷' },
      { title: '時計仕掛けの夢', note: '初の正気度0、新キャラ作成' },
    ],
  },
  mystery: {
    groupName: '土曜マダミス会',
    systemName: null,
    startedOn: '2023-09-01',
    blurb: '月2-3公演。ネタバレ厳禁、共演者常時募集中。',
    contactUrl: 'https://twitter.com/example_madamis',
    lastPlayedOn: '2025-05-12',
    total: 38,
    completed: 32,
    months: 20,
    uniqueTitles: 26,
    attendeeSum: 165,
    ranked: [
      { name: 'あや（GM多め）', c: 38 },
      { name: 'たく', c: 22 },
      { name: 'みく', c: 18 },
      { name: 'けい', c: 15 },
      { name: 'ゲスト勢', c: 48 },
    ],
    highlights: [
      { title: '昭和荘の七日間', note: '全員でハッピーエンドに辿り着いた回' },
      {
        title: '密室の招待状',
        note: '犯人推理で全員一致、決定的証拠が突けた',
        spoiler: true,
      },
      { title: '時の砂', note: '初参加の方が真相到達！', spoiler: true },
    ],
  },
  werewolf: {
    groupName: '水曜オンライン人狼',
    systemName: 'クラシック・賢者・狐入り',
    startedOn: '2024-06-01',
    blurb: 'Zoom人狼週2回・初心者村あり。常時メンバー募集中。',
    contactUrl: 'https://discord.gg/example_jinrou',
    lastPlayedOn: '2025-05-14',
    total: 84,
    completed: 41,
    months: 12,
    ranked: [
      { name: 'シン（進行多め）', c: 84 },
      { name: 'リョウ', c: 70 },
      { name: 'マイ', c: 64 },
      { name: 'ハル', c: 55 },
      { name: 'タカ', c: 50 },
      { name: 'ユウ', c: 42 },
      { name: '常連勢', c: 180 },
    ],
    highlights: [
      { title: '第34回', note: '占い欠けで村陣営涙の勝利' },
      { title: '第28回', note: '人狼サイド完璧な進行で陥落' },
      { title: '初心者村', note: '初参加3名のうち2人が人狼陣営勝利' },
    ],
  },
  boardgame: {
    groupName: '月一ボドゲ会@渋谷',
    systemName: null,
    startedOn: '2022-03-01',
    blurb: '月1土曜13時～。固定6人＋ゲスト歓迎。初心者OK。',
    contactUrl: 'https://twitter.com/example_bg',
    lastPlayedOn: '2025-05-10',
    total: 38,
    completed: 0,
    months: 38,
    playedGames: 92,
    ranked: [
      { name: 'ヨシ（主催）', c: 38 },
      { name: 'たけ', c: 35 },
      { name: 'まり', c: 33 },
      { name: 'あや', c: 30 },
      { name: 'ケン', c: 28 },
      { name: 'ゲスト勢', c: 60 },
    ],
    highlights: [
      { title: 'ナナ', note: '初の完全協力勝利、興奮' },
      { title: 'カタン', note: '逆転10pt決め' },
      { title: '宝石の煌めき', note: '常連まりが5連勝' },
    ],
  },
}

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  const sp = await searchParams
  const kind: Kind = (KIND_LIST as readonly string[]).includes(sp.kind ?? '')
    ? (sp.kind as Kind)
    : 'trpg'
  const sample = SAMPLES[kind]
  const isBoardgame = kind === 'boardgame'
  const isMystery = kind === 'mystery'
  const pace = (sample.total / sample.months).toFixed(1)
  const rankLabel = rank(sample.total, sample.months)
  const completedLabel = COMPLETED_LABEL_BY_CATEGORY[kind] ?? null

  const stats = getCardStats(kind, {
    total: sample.total,
    isEmpty: false,
    periodLabel: periodLabel(sample.months),
    pace,
    uniqueTitles: sample.uniqueTitles,
    attendeeSum: sample.attendeeSum,
  })

  // メンバー上位7名＋以降省略
  const TOP_N = 7
  const rankedTop = sample.ranked.slice(0, TOP_N)
  const rankedRest = sample.ranked.length - rankedTop.length
  const membersText =
    rankedTop.map((r) => `${r.name}（${r.c}）`).join('・') +
    (rankedRest > 0 ? `…他${rankedRest}名` : '')

  let supplementary: string | null = null
  if (isBoardgame && sample.playedGames) {
    supplementary = `遊んだゲーム ${sample.playedGames} タイトル`
  } else if (!isBoardgame && !isMystery && completedLabel && sample.completed) {
    supplementary = `${completedLabel} ${sample.completed} 本`
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-xl md:py-12">
      <div className="border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-xs text-[var(--ink-2)]">
        <strong className="text-[var(--brass)]">見本表示</strong>　架空の卓・架空のメンバーです（実在のユーザーデータは含みません）。
      </div>

      <nav className="mt-4 flex flex-wrap gap-2">
        {KIND_LIST.map((k) => (
          <Link
            key={k}
            href={`/demo?kind=${k}`}
            className={
              k === kind
                ? 'border-2 border-[var(--ink)] bg-[var(--ink)] px-3 py-1 text-xs font-medium tracking-[0.1em] text-[var(--paper)]'
                : 'border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-1 text-xs tracking-[0.1em] text-[var(--ink-2)] hover:bg-[var(--paper-2)]'
            }
          >
            {KIND_LABEL[k]}
          </Link>
        ))}
      </nav>

      <div className="mt-4">
        <CardPresenter
          category={kind}
          groupName={sample.groupName}
          systemName={sample.systemName}
          stats={stats}
          supplementary={supplementary}
          members={membersText}
          highlights={sample.highlights}
          rankLabel={rankLabel}
          footerRight={`最終開催 ${sample.lastPlayedOn}`}
          blurb={sample.blurb}
        />
      </div>

      <p className="mt-4 text-center text-xs text-[var(--ink-3)]">
        実際の卓もこの1枚をスクショまたは公開URLとして共有できます
      </p>

      <div className="mt-6 border-2 border-[var(--ink)] bg-[var(--paper)] p-5 text-center">
        <p className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
          この卓に参加したい方
        </p>
        <p className="mt-1 text-xs text-[var(--ink-2)]">
          主催が指定した連絡先からどうぞ（見本です）。
        </p>
        <a
          href={sample.contactUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-block border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium tracking-[0.1em] text-[var(--paper)] hover:bg-[var(--ink-2)]"
        >
          参加希望はこちら（見本）
        </a>
        <p className="mt-3 border-t border-dotted border-[var(--rule)] pt-3 text-xs text-[var(--ink-2)]">
          あなたの卓・会も、こんな1枚にできます。記録は数十秒。続けるほど「顔」になります。
        </p>
        <Link
          href="/login"
          className="mt-2 inline-block border-b border-[var(--vermilion)] text-xs text-[var(--vermilion)] hover:text-[var(--vermilion-deep)]"
        >
          自分の卓を綴じる（無料）
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--ink-3)]">
        <Link href="/" className="hover:text-[var(--ink-2)]">卓録について</Link>
        <span className="mx-2 text-[var(--rule)]">／</span>
        <Link href="/legal" className="hover:text-[var(--ink-2)]">利用規約・プライバシー</Link>
      </p>
    </main>
  )
}
