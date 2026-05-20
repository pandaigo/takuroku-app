import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/require-auth'
import { signOut } from './actions'
import { KIND_LABEL, TONE } from '@/lib/genre'

export default async function Home() {
  await requireAuth()
  const supabase = await createClient()

  // 集計用クエリを並列実行
  const [groupsRes, groupCountRes, sessionCountRes, memberCountRes, recentRes] =
    await Promise.all([
      supabase
        .from('groups')
        .select('id, name, category, system_name')
        .order('created_at', { ascending: false }),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null),
      supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null),
      supabase
        .from('sessions')
        .select('id, played_on, title, note, groups(name, category)')
        .is('deleted_at', null)
        .order('played_on', { ascending: false })
        .limit(5),
    ])

  const groups = groupsRes.data ?? []
  const groupCount = groupCountRes.count ?? 0
  const sessionCount = sessionCountRes.count ?? 0
  const memberCount = memberCountRes.count ?? 0
  const recent =
    (recentRes.data as
      | Array<{
          id: string
          played_on: string
          title: string
          note: string | null
          groups: { name: string; category: string } | null
        }>
      | null) ?? []

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <header className="flex items-center justify-between border-b-2 border-double border-[var(--rule-strong)] pb-3">
        <div className="flex items-center gap-2">
          <span className="stamp-sq h-8 w-8 text-sm" aria-hidden>
            卓
          </span>
          <span
            translate="no"
            className="font-[family-name:var(--font-mincho)] text-lg font-semibold tracking-[0.2em] text-[var(--ink)]"
          >
            卓 録
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--ink-2)]">
          <Link href="/account" className="hover:text-[var(--ink)]">
            手帳
          </Link>
          <form>
            <button
              formAction={signOut}
              className="hover:text-[var(--ink)]"
            >
              退室
            </button>
          </form>
        </div>
      </header>

      {/* 集計サマリー：3列縦罫の年鑑帳目次風 */}
      <section className="mt-6 grid grid-cols-3 divide-x divide-[var(--rule)] border border-[var(--rule-strong)] bg-[var(--paper)] py-4 text-center">
        <div className="px-2">
          <p className="tabular text-3xl font-semibold leading-none text-[var(--ink)]">
            {groupCount}
          </p>
          <p className="mt-1.5 text-[10px] tracking-[0.3em] text-[var(--ink-2)]">
            卓 ・ 会
          </p>
        </div>
        <div className="px-2">
          <p className="tabular text-3xl font-semibold leading-none text-[var(--ink)]">
            {sessionCount}
          </p>
          <p className="mt-1.5 text-[10px] tracking-[0.3em] text-[var(--ink-2)]">
            通 算 開 催
          </p>
        </div>
        <div className="px-2">
          <p className="tabular text-3xl font-semibold leading-none text-[var(--ink)]">
            {memberCount}
          </p>
          <p className="mt-1.5 text-[10px] tracking-[0.3em] text-[var(--ink-2)]">
            同 卓 者
          </p>
        </div>
      </section>

      <div className="mt-10 flex items-end justify-between border-b border-[var(--rule)] pb-2">
        <h2 className="font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
          手元の卓・会
        </h2>
        <Link
          href="/groups/new"
          className="border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-1.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--paper-2)]"
        >
          ＋ 新しく綴じる
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {groups.length === 0 ? (
          <li className="col-span-full border-2 border-dashed border-[var(--rule-strong)] bg-[var(--paper)] px-6 py-10 text-center">
            <p className="font-[family-name:var(--font-mincho)] text-base font-semibold text-[var(--ink)]">
              まだ一冊もありません。
            </p>
            <ul className="chapter-list mx-auto mt-4 max-w-sm space-y-1.5 pl-2 text-left text-sm text-[var(--ink-2)]">
              <li>主催している卓を綴じて、誰と・何回遊んだかを記録</li>
              <li>1回の記録は数十秒。前回の出席者は最初から選択済み</li>
              <li>卓の歴史が1枚のカードに。スクショや公開URLで共有</li>
            </ul>
            <p className="mt-5 text-center text-xs">
              <Link
                href="/demo"
                className="border-b border-[var(--vermilion)] text-[var(--vermilion)] hover:text-[var(--vermilion-deep)]"
              >
                見本の卓年鑑を見る
              </Link>
            </p>
          </li>
        ) : (
          groups.map((g) => {
            const t = TONE[g.category] ?? TONE.other
            return (
              <li key={g.id}>
                <Link
                  href={`/groups/${g.id}`}
                  className="flex items-start gap-3 border border-[var(--rule-strong)] bg-[var(--paper)] p-4 transition-shadow hover:shadow-[2px_2px_0_0_var(--paper-edge)]"
                >
                  <span
                    className="stamp-sq h-10 w-10 shrink-0 text-base"
                    style={{ borderColor: t.hex, color: t.hex }}
                    aria-hidden
                  >
                    {t.mark}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-[family-name:var(--font-mincho)] truncate text-base font-semibold text-[var(--ink)]">
                      {g.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ink-2)]">
                      {KIND_LABEL[g.category] ?? g.category}
                      {g.system_name ? `／${g.system_name}` : ''}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })
        )}
      </ul>

      {/* 最近の動き：罫線リスト */}
      {recent.length > 0 ? (
        <section className="mt-10">
          <h2 className="border-b border-[var(--rule)] pb-1 font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
            近 況
          </h2>
          <ul className="mt-2 divide-y divide-[var(--rule)] border-b border-[var(--rule)]">
            {recent.map((s) => {
              const cat = s.groups?.category ?? 'other'
              const t = TONE[cat] ?? TONE.other
              return (
                <li
                  key={s.id}
                  className="flex items-start gap-3 px-1 py-2"
                >
                  <span
                    className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center border font-[family-name:var(--font-mincho)] text-[10px] font-semibold"
                    style={{ borderColor: t.hex, color: t.hex }}
                    aria-hidden
                  >
                    {t.mark}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--ink)]">
                      {s.title}
                    </p>
                    <p className="truncate text-xs text-[var(--ink-2)]">
                      {s.groups?.name ?? '—'}・{s.played_on}
                      {s.note ? `・「${s.note}」` : ''}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
