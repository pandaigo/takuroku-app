import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/require-auth'
import { getUserId } from '@/lib/auth'
import { markCardShared } from './actions'
import { publishCard, revokePublicLink } from './publish-actions'
import {
  COMPLETED_LABEL_BY_CATEGORY,
  countUniqueGames,
  getCardStats,
  monthsBetween,
  periodLabel,
  rank,
} from '@/lib/genre'
import { CardPresenter } from '@/components/card-presenter'
import { CopyShareButtons } from '@/components/copy-share-buttons'
import { PrintButton } from '@/components/print-button'

export default async function CardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    shared?: string
    published?: string
    revoked?: string
    error?: string
  }>
}) {
  const { id } = await params
  const sp = await searchParams
  await requireAuth()
  const supabase = await createClient()

  const { data: group } = await supabase
    .from('groups')
    .select('id, name, category, system_name, started_on, blurb, contact_url')
    .eq('id', id)
    .single()
  if (!group) notFound()

  const { data: members } = await supabase
    .from('members')
    .select('id, display_name')
    .eq('group_id', id)
    .is('deleted_at', null)

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, played_on, title, note, status, session_attendees(member_id)')
    .eq('group_id', id)
    .is('deleted_at', null)
    .order('played_on', { ascending: false })

  const { data: activeLink } = await supabase
    .from('public_links')
    .select('id, token, created_at')
    .eq('group_id', id)
    .is('revoked_at', null)
    .is('suspended_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const baseUrl = `${proto}://${host}`
  const publicUrl = activeLink ? `${baseUrl}/c/${activeLink.token}` : null

  const list = sessions ?? []
  const total = list.length
  const completed = list.filter((s) => s.status === 'cleared').length
  const isEmpty = total === 0
  const completedLabel = COMPLETED_LABEL_BY_CATEGORY[group.category] ?? null
  const isBoardgame = group.category === 'boardgame'
  const isMystery = group.category === 'mystery'
  const playedGames = isBoardgame
    ? countUniqueGames(list.map((s) => (s.title as string) ?? ''))
    : 0
  const lastPlayed = list[0]?.played_on ?? null

  const memberName = new Map(
    (members ?? []).map((m) => [m.id, m.display_name]),
  )
  const counts = new Map<string, number>()
  for (const s of list) {
    for (const a of s.session_attendees ?? []) {
      counts.set(a.member_id, (counts.get(a.member_id) ?? 0) + 1)
    }
  }
  const ranked = [...counts.entries()]
    .map(([mid, c]) => ({ name: memberName.get(mid) ?? '—', c }))
    .sort((a, b) => b.c - a.c)

  const dates = list.map((s) => s.played_on).filter(Boolean) as string[]
  const earliest =
    group.started_on ?? (dates.length ? dates[dates.length - 1] : null)
  const now = new Date()
  const from = earliest ? new Date(earliest) : now
  const months = monthsBetween(from, now)
  const pace = total > 0 ? (total / months).toFixed(1) : '0'

  const uniqueTitles = new Set(
    list.map((s) => (s.title as string)?.trim()).filter(Boolean),
  ).size
  const attendeeSum = list.reduce(
    (sum, s) => sum + (s.session_attendees?.length ?? 0),
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

  const TOP_N = 7
  const rankedTop = ranked.slice(0, TOP_N)
  const rankedRest = ranked.length - rankedTop.length
  const membersText =
    ranked.length > 0
      ? rankedTop.map((r) => `${r.name}(${r.c})`).join('・') +
        (rankedRest > 0 ? `…他${rankedRest}名` : '')
      : (members ?? []).map((m) => m.display_name).join('・') || 'まだいません'

  let supplementary: string | null = null
  if (isBoardgame && playedGames > 0) {
    supplementary = `遊んだゲーム ${playedGames} タイトル`
  } else if (!isBoardgame && !isMystery && completedLabel && completed > 0) {
    supplementary = `${completedLabel} ${completed} 本`
  }

  const highlights = list
    .filter((s) => s.note)
    .slice(0, 3)
    .map((s) => ({ title: s.title as string, note: s.note as string }))

  const uid = await getUserId()
  if (uid) {
    void supabase.from('events').insert({
      user_id: uid,
      group_id: id,
      type: 'card_viewed',
    })
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-xl md:py-12">
      <Link
        href={`/groups/${id}`}
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← 卓にもどる
      </Link>

      <div id="print-card" className="mt-4">
        <CardPresenter
          category={group.category}
          groupName={group.name}
          systemName={group.system_name}
          stats={stats}
          supplementary={supplementary}
          members={membersText}
          highlights={highlights}
          rankLabel={rank(total, months)}
          footerRight={lastPlayed ? `最終開催 ${lastPlayed}` : '卓録'}
          blurb={group.blurb}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 print:hidden">
        <p className="text-xs text-[var(--ink-3)]">
          スクショして Discord や X に貼れます
        </p>
        <PrintButton label="PDF にする" />
      </div>

      <section className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper)] p-5">
        {publicUrl && activeLink ? (
          <div>
            <p className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
              公開URL（ログイン無しで閲覧可）
            </p>
            <p className="mt-2 break-all border border-[var(--rule)] bg-[var(--paper-2)] p-2 font-mono text-xs text-[var(--ink)]">
              {publicUrl}
            </p>
            <CopyShareButtons
              url={publicUrl}
              title={`${group.name}｜卓録`}
              xText={`【${group.name}】通算${total}回${
                months >= 12
                  ? `・${Math.floor(months / 12)}年${months % 12 > 0 ? `${months % 12}ヶ月` : ''}継続`
                  : months > 0
                    ? `・${months}ヶ月継続`
                    : ''
              }${lastPlayed ? `（最終 ${lastPlayed}）` : ''}\n卓年鑑カードを公開しました。`}
            />
            <p className="mt-2 text-xs leading-relaxed text-[var(--ink-2)]">
              このURLを Discord や X に貼ると、相手はログイン無しで卓年鑑カードを見られます。
              {group.contact_url
                ? '受け手には「参加希望はこちら」ボタンも出ます。'
                : '※連絡先URL未設定。受け手から連絡できる場所（X/Discord等）を卓編集で追加すると勧誘に効きます。'}
            </p>
            {sp.published ? (
              <p
                aria-live="polite"
                className="mt-3 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-sm text-[var(--brass)]"
              >
                公開URLを発行しました。
              </p>
            ) : null}
            <form action={revokePublicLink} className="mt-3">
              <input type="hidden" name="group_id" value={id} />
              <input type="hidden" name="link_id" value={activeLink.id} />
              <button className="border-2 border-[var(--vermilion)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--vermilion)] hover:bg-[rgba(168,50,45,0.06)]">
                公開を停止
              </button>
            </form>
          </div>
        ) : (
          <form action={publishCard} className="flex flex-col gap-3">
            <input type="hidden" name="group_id" value={id} />
            <p className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.15em] text-[var(--ink)]">
              公開URLを発行する
            </p>
            <p className="text-xs leading-relaxed text-[var(--ink-2)]">
              発行すると、URLを知る誰でもログイン無しで卓年鑑カードを閲覧できます。
              <strong className="text-[var(--ink)]">メンバー名が掲載される</strong>
              ため、登録したメンバー一人ひとりに事前に同意を得ていることを確認してください。いつでも公開停止できます。
            </p>
            <label className="flex items-start gap-2 text-xs text-[var(--ink-2)]">
              <input
                type="checkbox"
                name="consent"
                required
                className="mt-0.5"
              />
              <span>
                掲載するメンバー全員から、名前を公開することについて事前に同意を取得しています。
              </span>
            </label>
            {sp.revoked ? (
              <p className="border border-[var(--rule)] bg-[var(--paper-2)] px-3 py-2 text-xs text-[var(--ink-2)]">
                公開を停止しました。
              </p>
            ) : null}
            {sp.error === 'consent_required' ? (
              <p
                aria-live="polite"
                className="border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-xs text-[var(--vermilion-deep)]"
              >
                同意確認のチェックが必要です。
              </p>
            ) : sp.error === 'publish_failed' ? (
              <p
                aria-live="polite"
                className="border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-xs text-[var(--vermilion-deep)]"
              >
                発行に失敗しました。少し時間をおいて再度お試しください。
              </p>
            ) : null}
            <button className="self-start border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium tracking-[0.15em] text-[var(--paper)] hover:bg-[var(--ink-2)]">
              公 開 す る
            </button>
          </form>
        )}
      </section>

      {sp.shared ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-center text-sm text-[var(--brass)]"
        >
          記録しました。ありがとうございます。
        </p>
      ) : (
        <form action={markCardShared} className="mt-4 flex justify-center">
          <input type="hidden" name="group_id" value={id} />
          <button className="border border-[var(--rule-strong)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]">
            このカードを共有・勧誘に使った
          </button>
        </form>
      )}
    </main>
  )
}
