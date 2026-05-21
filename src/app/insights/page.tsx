import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/require-auth'
import { TONE } from '@/lib/genre'

export const metadata: Metadata = {
  title: '分析｜卓録',
  description: 'すべての卓を横断した同卓者・シナリオの集計',
  robots: { index: false, follow: false },
}

type GroupRow = { id: string; name: string; category: string }
type MemberRow = {
  id: string
  group_id: string
  display_name: string
  deleted_at: string | null
}
type SessionRow = {
  id: string
  group_id: string
  played_on: string
  title: string
  status: string | null
}
type AttendeeRow = { session_id: string; member_id: string }

// 3ヶ月（92日）以上不参加の PL を「離脱予兆」と判定する閾値。
const QUIET_DAYS = 92

export default async function InsightsPage() {
  await requireAuth()
  const supabase = await createClient()

  // ログインユーザーが owner の全卓を横断（RLS により他人の卓は出ない）。
  const [groupsRes, membersRes, sessionsRes, attendeesRes] = await Promise.all([
    supabase.from('groups').select('id, name, category'),
    supabase.from('members').select('id, group_id, display_name, deleted_at'),
    supabase
      .from('sessions')
      .select('id, group_id, played_on, title, status')
      .is('deleted_at', null),
    supabase.from('session_attendees').select('session_id, member_id'),
  ])

  const groups = (groupsRes.data as GroupRow[] | null) ?? []
  const members = (membersRes.data as MemberRow[] | null) ?? []
  const sessions = (sessionsRes.data as SessionRow[] | null) ?? []
  const attendees = (attendeesRes.data as AttendeeRow[] | null) ?? []

  // member_id → display_name / group_id マップ
  const memberMap = new Map<string, MemberRow>()
  for (const m of members) memberMap.set(m.id, m)

  // session_id → session マップ
  const sessionMap = new Map<string, SessionRow>()
  for (const s of sessions) sessionMap.set(s.id, s)

  // group_id → group マップ
  const groupMap = new Map<string, GroupRow>()
  for (const g of groups) groupMap.set(g.id, g)

  // PL 名寄せ：display_name 単位で同一人物として扱う（揺れは UI で手動修正の方針）
  // 集計：出席回数・最終出席日・関与卓セット
  type PlStat = {
    name: string
    count: number
    lastDate: string | null
    groupIds: Set<string>
  }
  const plStats = new Map<string, PlStat>()
  for (const a of attendees) {
    const m = memberMap.get(a.member_id)
    const s = sessionMap.get(a.session_id)
    if (!m || !s) continue
    if (m.deleted_at) continue
    const key = m.display_name
    let stat = plStats.get(key)
    if (!stat) {
      stat = { name: key, count: 0, lastDate: null, groupIds: new Set() }
      plStats.set(key, stat)
    }
    stat.count += 1
    if (!stat.lastDate || s.played_on > stat.lastDate) {
      stat.lastDate = s.played_on
    }
    stat.groupIds.add(s.group_id)
  }

  const todayIso = new Date().toISOString().slice(0, 10)
  const daysSince = (date: string | null) => {
    if (!date) return Infinity
    const ms = new Date(todayIso).getTime() - new Date(date).getTime()
    return Math.floor(ms / (1000 * 60 * 60 * 24))
  }

  const plList = [...plStats.values()].sort((a, b) => b.count - a.count)

  // 卓横断 PL：2 つ以上の卓に出ている PL
  const crossGroupPls = plList.filter((p) => p.groupIds.size >= 2)

  // 離脱予兆：直近 QUIET_DAYS 以上、卓に出てない PL
  const quietPls = plList.filter(
    (p) => p.lastDate && daysSince(p.lastDate) >= QUIET_DAYS,
  )

  // シナリオ（タイトル）別の集計：同じタイトルが複数卓で記録されたら「被り」とする
  type ScenarioStat = {
    title: string
    count: number
    groupIds: Set<string>
    lastDate: string | null
    completedCount: number
  }
  const scenarioStats = new Map<string, ScenarioStat>()
  for (const s of sessions) {
    const t = s.title.trim()
    if (!t) continue
    let stat = scenarioStats.get(t)
    if (!stat) {
      stat = {
        title: t,
        count: 0,
        groupIds: new Set(),
        lastDate: null,
        completedCount: 0,
      }
      scenarioStats.set(t, stat)
    }
    stat.count += 1
    stat.groupIds.add(s.group_id)
    if (s.status === 'cleared') stat.completedCount += 1
    if (!stat.lastDate || s.played_on > stat.lastDate) {
      stat.lastDate = s.played_on
    }
  }

  const scenarioList = [...scenarioStats.values()].sort(
    (a, b) => b.count - a.count,
  )
  const duplicatedScenarios = scenarioList.filter(
    (sc) => sc.groupIds.size >= 2,
  )

  // サマリー数値
  const totalGroups = groups.length
  const totalSessions = sessions.length
  const totalUniqueMembers = plStats.size
  const totalScenarios = scenarioStats.size

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:max-w-3xl md:py-12">
      <nav className="text-sm text-[var(--ink-2)]">
        <Link href="/" className="hover:text-[var(--ink)]">
          卓録トップ
        </Link>
        <span className="mx-2 text-[var(--rule)]">／</span>
        <span className="text-[var(--ink-3)]">分析</span>
      </nav>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        分 析
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">
        すべての卓を横断した同卓者・シナリオの集計。離脱予兆や被りシナリオを早めに把握できます。
      </p>

      {/* サマリー：4 列縦罫 */}
      <section className="mt-6 grid grid-cols-2 divide-x divide-y divide-[var(--rule)] border border-[var(--rule-strong)] text-center sm:grid-cols-4 sm:divide-y-0">
        {[
          { value: totalGroups, label: '卓 ・ 会' },
          { value: totalSessions, label: '通 算 開 催' },
          { value: totalUniqueMembers, label: '同 卓 者' },
          { value: totalScenarios, label: 'シ ナ リ オ' },
        ].map((s, i) => (
          <div key={i} className="px-2 py-4">
            <p className="text-[10px] tracking-[0.25em] text-[var(--ink-2)]">
              {s.label}
            </p>
            <p className="tabular mt-2 text-2xl font-semibold leading-none text-[var(--ink)]">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {/* 卓横断 PL */}
      <section className="mt-10">
        <h2 className="border-b border-[var(--rule)] pb-1 font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
          複 数 卓 で 活 動 す る 同 卓 者
          <span className="ml-2 font-sans text-[10px] tracking-normal text-[var(--ink-3)]">
            （{crossGroupPls.length}名）
          </span>
        </h2>
        {crossGroupPls.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--ink-3)]">
            2 つ以上の卓に出ている同卓者はまだいません。
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--rule)] border-b border-[var(--rule)]">
            {crossGroupPls.slice(0, 20).map((p) => (
              <li
                key={p.name}
                className="flex items-baseline justify-between gap-3 px-1 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-[family-name:var(--font-mincho)] truncate text-sm font-medium text-[var(--ink)]">
                    {p.name}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-1.5 text-[10px] text-[var(--ink-3)]">
                    {[...p.groupIds].map((gid) => {
                      const g = groupMap.get(gid)
                      const tone = g ? TONE[g.category] ?? TONE.other : null
                      return (
                        <span
                          key={gid}
                          className="border px-1.5 py-0.5"
                          style={
                            tone
                              ? { borderColor: tone.hex, color: tone.hex }
                              : undefined
                          }
                        >
                          {g?.name ?? '—'}
                        </span>
                      )
                    })}
                  </p>
                </div>
                <span className="tabular shrink-0 text-sm font-semibold text-[var(--ink)]">
                  {p.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 離脱予兆 */}
      <section className="mt-10">
        <h2 className="border-b border-[var(--rule)] pb-1 font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
          離 脱 予 兆
          <span className="ml-2 font-sans text-[10px] tracking-normal text-[var(--ink-3)]">
            （{QUIET_DAYS}日以上不参加・{quietPls.length}名）
          </span>
        </h2>
        {quietPls.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--ink-3)]">
            該当する同卓者はいません。
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--rule)] border-b border-[var(--rule)]">
            {quietPls.slice(0, 20).map((p) => (
              <li
                key={p.name}
                className="flex items-baseline justify-between gap-3 px-1 py-2"
              >
                <span className="font-[family-name:var(--font-mincho)] truncate text-sm font-medium text-[var(--ink)]">
                  {p.name}
                </span>
                <span className="tabular shrink-0 text-xs text-[var(--vermilion)]">
                  最終 {p.lastDate}（{daysSince(p.lastDate)}日前）
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* シナリオ被り */}
      <section className="mt-10">
        <h2 className="border-b border-[var(--rule)] pb-1 font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
          別 卓 で 被 っ た シ ナ リ オ
          <span className="ml-2 font-sans text-[10px] tracking-normal text-[var(--ink-3)]">
            （{duplicatedScenarios.length}件）
          </span>
        </h2>
        {duplicatedScenarios.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--ink-3)]">
            複数卓で被ったシナリオはまだありません。
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--rule)] border-b border-[var(--rule)]">
            {duplicatedScenarios.slice(0, 20).map((sc) => (
              <li
                key={sc.title}
                className="flex items-baseline justify-between gap-3 px-1 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--ink)]">
                    {sc.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-1.5 text-[10px] text-[var(--ink-3)]">
                    {[...sc.groupIds].map((gid) => {
                      const g = groupMap.get(gid)
                      const tone = g ? TONE[g.category] ?? TONE.other : null
                      return (
                        <span
                          key={gid}
                          className="border px-1.5 py-0.5"
                          style={
                            tone
                              ? { borderColor: tone.hex, color: tone.hex }
                              : undefined
                          }
                        >
                          {g?.name ?? '—'}
                        </span>
                      )
                    })}
                  </p>
                </div>
                <span className="tabular shrink-0 text-sm font-semibold text-[var(--ink)]">
                  {sc.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* シナリオ全リスト */}
      <section className="mt-10">
        <h2 className="border-b border-[var(--rule)] pb-1 font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
          シ ナ リ オ 一 覧
          <span className="ml-2 font-sans text-[10px] tracking-normal text-[var(--ink-3)]">
            （上位 30 件・通算プレイ数順）
          </span>
        </h2>
        {scenarioList.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--ink-3)]">
            シナリオがまだ記録されていません。
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--rule)] border-b border-[var(--rule)]">
            {scenarioList.slice(0, 30).map((sc) => (
              <li
                key={sc.title}
                className="flex items-baseline justify-between gap-3 px-1 py-2"
              >
                <span className="truncate text-sm text-[var(--ink)]">
                  {sc.title}
                  {sc.groupIds.size >= 2 ? (
                    <span className="ml-2 inline-block border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-1.5 text-[10px] text-[var(--brass)]">
                      被り
                    </span>
                  ) : null}
                </span>
                <span className="tabular shrink-0 text-xs text-[var(--ink-2)]">
                  {sc.count}回
                  {sc.completedCount > 0
                    ? ` ／ 完走 ${sc.completedCount}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-xs leading-relaxed text-[var(--ink-3)]">
        ※ 同卓者は{' '}
        <code className="bg-[var(--paper-2)] px-1">display_name</code>{' '}
        で名寄せしています。同じ人を別表記で登録した場合は別人として集計されます。
      </p>
    </main>
  )
}
