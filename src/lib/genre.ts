// 種別ごとの語彙・選択肢・カード文言・トーンを一元管理。
// 種別UIを増やすときはここを更新する（コードの散逸を防ぐ）。

export const KIND_LABEL: Record<string, string> = {
  trpg: 'TRPG卓',
  mystery: 'マダミス卓',
  werewolf: '人狼会',
  boardgame: 'ボドゲ会',
  other: 'その他',
}

export const TITLE_PLACEHOLDER: Record<string, string> = {
  trpg: 'シナリオ名（複数可）',
  mystery: 'シナリオ名',
  werewolf: '村名・回（例: 第3回 / 中編村）',
  boardgame: 'ゲーム名（複数可・カンマ区切り）',
  other: 'タイトル',
}

export const ROLE_PLACEHOLDER: Record<string, string> = {
  trpg: '役割（任意・GM/KP/PL）',
  mystery: '役割（任意・GM/PL/見学）',
  werewolf: '役割（任意・進行/参加）',
  boardgame: '役割（任意）',
  other: '役割（任意）',
}

// 記録フォームの「結果」セレクトの選択肢。空配列＝セレクト自体を非表示。
export const STATUS_OPTIONS_BY_CATEGORY: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  trpg: [
    { value: '', label: '結果（任意）' },
    { value: 'cleared', label: 'クリア／完走' },
    { value: 'ongoing', label: '進行中（続き）' },
    { value: 'tpk', label: '全滅（TPK）' },
  ],
  mystery: [
    { value: '', label: '結果（任意）' },
    { value: 'cleared', label: '真相到達' },
    { value: 'ongoing', label: '中断' },
    { value: 'tpk', label: '未解決' },
  ],
  werewolf: [
    { value: '', label: '結果（任意）' },
    { value: 'cleared', label: '村陣営勝利' },
    { value: 'tpk', label: '人狼陣営勝利' },
    { value: 'ongoing', label: '中断' },
  ],
  boardgame: [],
  other: [],
}

// 履歴行で表示する「結果バッジ」のラベル。種別 → status → 文言。
export const STATUS_LABEL_BY_CATEGORY: Record<
  string,
  Record<string, string>
> = {
  trpg: { cleared: 'クリア／完走', ongoing: '進行中', tpk: '全滅（TPK）' },
  mystery: { cleared: '真相到達', ongoing: '中断', tpk: '未解決' },
  werewolf: {
    cleared: '村陣営勝利',
    ongoing: '中断',
    tpk: '人狼陣営勝利',
  },
  boardgame: {},
  other: {},
}

// カードの「完走シナリオ N 本」相当のラベル。null=非表示。
export const COMPLETED_LABEL_BY_CATEGORY: Record<string, string | null> = {
  trpg: '完走シナリオ',
  mystery: '真相到達',
  werewolf: '村陣営勝利',
  boardgame: null,
  other: null,
}

// ボドゲ会用：title 内の複数ゲーム名（カンマ・読点・スラッシュ等で区切り）を
// 集計してユニークなゲーム数を数える。
export function countUniqueGames(titles: string[]): number {
  const set = new Set<string>()
  for (const t of titles) {
    if (!t) continue
    t
      .split(/[,、・\/／]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((p) => set.add(p))
  }
  return set.size
}

// カードの3グリッド指標を種別ごとに切り替える。
export type CardStat = { value: string; label: string }
export function getCardStats(
  category: string,
  computed: {
    total: number
    isEmpty: boolean
    periodLabel: string
    pace: string
    uniqueTitles?: number
    attendeeSum?: number
  },
): [CardStat, CardStat, CardStat] {
  if (computed.isEmpty) {
    return [
      { value: '0', label: '通算開催' },
      { value: '結成', label: '継続' },
      { value: 'これから', label: 'ペース' },
    ]
  }
  if (category === 'mystery') {
    return [
      { value: String(computed.total), label: '通算公演' },
      {
        value: String(computed.uniqueTitles ?? 0),
        label: '異なるシナリオ',
      },
      { value: String(computed.attendeeSum ?? 0), label: '共演者延べ' },
    ]
  }
  return [
    { value: String(computed.total), label: '通算開催' },
    { value: computed.periodLabel, label: '継続' },
    { value: `月${computed.pace}`, label: 'ペース' },
  ]
}

// 種別ごとの印鑑色と印字。
// 紙地＋墨字＋朱印が全体トーンなので、種別ごとの差は「角印の色と一字」だけで表現する。
export type Tone = {
  hex: string // 印鑑色（CSS color として inline style に渡す）
  mark: string // 印字一文字
}
export const TONE: Record<string, Tone> = {
  trpg: { hex: '#1e3a5f', mark: '卓' }, // 藍
  mystery: { hex: '#1a1815', mark: '密' }, // 墨
  werewolf: { hex: '#7a1f1f', mark: '狼' }, // 朱深
  boardgame: { hex: '#3d7068', mark: '盤' }, // 青磁
  other: { hex: '#5c5247', mark: '録' }, // 鈍
}

// 通算回数と続けた期間（ペース加味）で決まる称号
export function rank(total: number, months: number): string {
  if (total >= 50 || months >= 60) return '伝説卓'
  if (total >= 20 || months >= 24) return '歴戦'
  if (total >= 5 || months >= 6) return '常設卓'
  return '結成'
}

export function monthsBetween(from: Date, to: Date): number {
  const m =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  return Math.max(1, m + 1)
}

export function periodLabel(months: number): string {
  const y = Math.floor(months / 12)
  const mo = months % 12
  if (y > 0) return `${y}年${mo > 0 ? `${mo}ヶ月` : ''}`
  return `${months}ヶ月`
}
