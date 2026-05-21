import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/require-auth'
import {
  addMember,
  addSession,
  deleteMember,
  deleteSession,
  updateGroupSettings,
} from './actions'
import {
  KIND_LABEL,
  TITLE_PLACEHOLDER,
  ROLE_PLACEHOLDER,
  STATUS_OPTIONS_BY_CATEGORY,
  STATUS_LABEL_BY_CATEGORY,
  TONE,
} from '@/lib/genre'
import { AttendeeBulkToggle } from '@/components/attendee-bulk-toggle'

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  await requireAuth()
  const supabase = await createClient()

  const { data: group } = await supabase
    .from('groups')
    .select(
      'id, name, category, system_name, started_on, blurb, contact_url, discord_webhook_url',
    )
    .eq('id', id)
    .single()
  if (!group) notFound()

  const { data: members } = await supabase
    .from('members')
    .select('id, display_name, role')
    .eq('group_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, played_on, title, note, status, session_attendees(member_id)')
    .eq('group_id', id)
    .is('deleted_at', null)
    .order('played_on', { ascending: false })
    .limit(30)

  const memberName = new Map(
    (members ?? []).map((m) => [m.id, m.display_name]),
  )
  const today = new Date().toISOString().slice(0, 10)

  const latestSessionAttendees = new Set<string>(
    ((sessions ?? [])[0]?.session_attendees ?? []).map(
      (a: { member_id: string }) => a.member_id,
    ),
  )

  const statusOptions = STATUS_OPTIONS_BY_CATEGORY[group.category] ?? []
  const statusLabelMap = STATUS_LABEL_BY_CATEGORY[group.category] ?? {}
  const tone = TONE[group.category] ?? TONE.other

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Link
        href="/"
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← 卓一覧
      </Link>

      {/* タイトル＋種別角印 */}
      <div className="mt-4 flex items-start justify-between gap-4 border-b border-[var(--rule-strong)] pb-3">
        <div className="min-w-0">
          <span
            className="stamp-sq inline-flex h-8 w-8 items-center justify-center text-sm"
            style={{ borderColor: tone.hex, color: tone.hex }}
            aria-label={KIND_LABEL[group.category] ?? group.category}
          >
            {tone.mark}
          </span>
          <h1 className="mt-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.05em] text-[var(--ink)]">
            {group.name}
          </h1>
          <p className="mt-1 text-xs text-[var(--ink-2)]">
            {KIND_LABEL[group.category] ?? group.category}
            {group.system_name ? `／${group.system_name}` : ''}
            {group.started_on ? `　結成 ${group.started_on}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Link
            href={`/groups/${id}/card`}
            className="border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--paper-2)]"
          >
            卓年鑑カード
          </Link>
          <Link
            href={`/groups/${id}/import`}
            className="text-xs text-[var(--ink-2)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
          >
            一括投入（CSV）
          </Link>
        </div>
      </div>

      {sp.error ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-sm text-[var(--vermilion-deep)]"
        >
          {sp.error}
        </p>
      ) : null}
      {sp.message ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-sm text-[var(--brass)]"
        >
          {sp.message}
        </p>
      ) : null}

      {/* 卓の設定（Discord 連携など。デフォルトは折りたたみ） */}
      <details className="mt-6 border border-[var(--rule)] bg-[var(--paper)] px-4 py-3 text-sm">
        <summary className="cursor-pointer font-[family-name:var(--font-mincho)] tracking-[0.15em] text-[var(--ink-2)]">
          卓 の 設 定
          {group.discord_webhook_url ? (
            <span className="ml-3 inline-block border border-[var(--brass)] bg-[rgba(139,105,20,0.08)] px-2 py-0.5 text-[10px] font-medium tracking-normal text-[var(--brass)]">
              Discord 連携 ON
            </span>
          ) : null}
        </summary>
        <form
          action={updateGroupSettings}
          className="mt-4 flex flex-col gap-3"
        >
          <input type="hidden" name="group_id" value={id} />
          <label className="flex flex-col gap-1 text-xs text-[var(--ink-2)]">
            <span>
              <strong className="text-[var(--ink)]">Discord Webhook URL</strong>
              （任意・卓のサーバに記録を自動投稿）
            </span>
            <input
              name="discord_webhook_url"
              type="url"
              defaultValue={group.discord_webhook_url ?? ''}
              placeholder="https://discord.com/api/webhooks/..."
              spellCheck={false}
              autoComplete="off"
              className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
            <span className="text-[10px] text-[var(--ink-3)]">
              Discord サーバ設定 → 連携サービス → ウェブフック → URL をコピー。空にして保存で連携解除。
            </span>
          </label>
          <button className="self-start border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]">
            保存
          </button>
        </form>
      </details>

      {/* メンバー */}
      <section className="mt-8">
        <h2 className="border-b border-[var(--rule)] pb-1 font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
          同 卓 者
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(members ?? []).length === 0 ? (
            <li className="text-sm text-[var(--ink-2)]">
              まだいません。下から追加（本人登録は不要）。
            </li>
          ) : (
            (members ?? []).map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-0.5 border border-[var(--rule-strong)] bg-[var(--paper)] py-1 pl-3 pr-1 text-sm text-[var(--ink)]"
              >
                <span>
                  {m.display_name}
                  {m.role ? (
                    <span className="ml-1 text-xs text-[var(--ink-2)]">
                      （{m.role}）
                    </span>
                  ) : null}
                </span>
                <form action={deleteMember}>
                  <input type="hidden" name="group_id" value={id} />
                  <input type="hidden" name="member_id" value={m.id} />
                  <button
                    aria-label={`${m.display_name}を削除`}
                    title="削除"
                    className="px-1.5 text-[var(--ink-3)] hover:text-[var(--vermilion)]"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
        <form
          action={addMember}
          className="mt-3 flex flex-col gap-2"
        >
          <input type="hidden" name="group_id" value={id} />
          <div className="flex flex-wrap items-end gap-2">
            <input
              name="display_name"
              required
              placeholder="名前"
              className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
            <input
              name="role"
              placeholder={
                ROLE_PLACEHOLDER[group.category] ?? ROLE_PLACEHOLDER.other
              }
              className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
            <button className="border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]">
              ＋ 連名する
            </button>
          </div>
          <label className="flex items-start gap-2 text-xs text-[var(--ink-2)]">
            <input
              type="checkbox"
              name="consent_confirmed"
              required
              className="mt-0.5"
            />
            <span>
              この名前で記録することを<strong className="text-[var(--ink)]">本人から同意を得ています</strong>（公開URL発行時に掲載される可能性があります）
            </span>
          </label>
        </form>
      </section>

      {/* 卓0件オンボーディング */}
      {(sessions ?? []).length === 0 ? (
        <div className="mt-6 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] p-4 text-sm text-[var(--ink)]">
          <p className="font-[family-name:var(--font-mincho)] font-semibold tracking-[0.1em] text-[var(--brass)]">
            ── 過去にあった集まりも、遡って記録できます。
          </p>
          <p className="mt-1 text-xs text-[var(--ink-2)]">
            今日からこの卓のカードを「顔」にするには、過去の集まりを2〜3件入れるのがおすすめです。日付を過去にして「記録する」を押すだけ。
          </p>
        </div>
      ) : null}

      {/* セッション記録 */}
      <section className="mt-10">
        <h2 className="border-b border-[var(--rule)] pb-1 font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
          記 録 す る
        </h2>
        <form
          action={addSession}
          className="mt-3 flex flex-col gap-3 border border-[var(--rule-strong)] bg-[var(--paper)] p-4"
        >
          <input type="hidden" name="group_id" value={id} />
          <div className="flex flex-wrap gap-3">
            <input
              name="played_on"
              type="date"
              defaultValue={today}
              className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
            <input
              name="title"
              required
              placeholder={
                TITLE_PLACEHOLDER[group.category] ?? TITLE_PLACEHOLDER.other
              }
              className="min-w-[12rem] flex-1 border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
          </div>
          {(members ?? []).length > 0 ? (
            <fieldset id="attendee-list" className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <legend className="text-xs text-[var(--ink-2)]">
                  来た人
                  {latestSessionAttendees.size > 0
                    ? '（前回の出席者を既定で選択中）'
                    : ''}
                </legend>
                {(members ?? []).length >= 6 ? (
                  <AttendeeBulkToggle fieldsetId="attendee-list" />
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {(members ?? []).map((m) => (
                  <label
                    key={m.id}
                    className="cursor-pointer border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-1 text-sm text-[var(--ink)] before:mr-1 before:font-bold before:opacity-0 before:content-['✓'] has-[:checked]:border-[var(--ink)] has-[:checked]:bg-[var(--ink)] has-[:checked]:text-[var(--paper)] has-[:checked]:before:opacity-100 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--vermilion)] has-[:focus-visible]:outline-offset-2"
                  >
                    <input
                      type="checkbox"
                      name="attendee"
                      value={m.id}
                      defaultChecked={latestSessionAttendees.has(m.id)}
                      className="sr-only"
                    />
                    {m.display_name}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <input
            name="new_attendees"
            placeholder="新しい人（その場で追加・カンマ区切り 例 田中, ゲスト佐藤）"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
          {statusOptions.length > 0 ? (
            <select
              name="status"
              defaultValue=""
              className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}
          <input
            name="note"
            placeholder="ひとこと・名場面（任意）"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
          <label className="flex items-start gap-2 text-xs text-[var(--ink-2)]">
            <input type="checkbox" name="note_spoiler" className="mt-0.5" />
            <span>
              この一言にネタバレが含まれる（公開URLでは折りたたみ表示する）
            </span>
          </label>
          <button className="self-start border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium tracking-[0.15em] text-[var(--paper)] hover:bg-[var(--ink-2)]">
            記 録 す る
          </button>
        </form>
      </section>

      {/* 履歴 */}
      <section className="mt-10">
        <h2 className="border-b border-[var(--rule)] pb-1 font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
          こ れ ま で の 記 録
          <span className="ml-2 font-sans text-[10px] tracking-normal text-[var(--ink-3)]">
            （{(sessions ?? []).length}件）
          </span>
        </h2>
        <ul className="mt-2 divide-y divide-[var(--rule)] border-b border-[var(--rule)]">
          {(sessions ?? []).length === 0 ? (
            <li className="py-3 text-sm text-[var(--ink-2)]">
              まだ記録がありません。
            </li>
          ) : (
            (sessions ?? []).map((s) => {
              const names = (s.session_attendees ?? [])
                .map((a: { member_id: string }) => memberName.get(a.member_id))
                .filter(Boolean)
              const statusLabel =
                s.status && statusLabelMap[s.status]
                  ? statusLabelMap[s.status]
                  : null
              return (
                <li key={s.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-[family-name:var(--font-mincho)] font-medium text-[var(--ink)]">
                      {s.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="tabular text-xs text-[var(--ink-2)]">
                        {s.played_on}
                      </span>
                      <form action={deleteSession}>
                        <input type="hidden" name="group_id" value={id} />
                        <input type="hidden" name="session_id" value={s.id} />
                        <button
                          aria-label="この記録を削除"
                          title="削除"
                          className="text-xs text-[var(--ink-3)] hover:text-[var(--vermilion)]"
                        >
                          削除
                        </button>
                      </form>
                    </div>
                  </div>
                  {statusLabel ? (
                    <span className="mt-1 inline-block border border-[var(--rule-strong)] bg-[var(--paper-2)] px-2 py-0.5 text-[11px] text-[var(--ink-2)]">
                      {statusLabel}
                    </span>
                  ) : null}
                  {names.length > 0 ? (
                    <p className="mt-1 text-xs text-[var(--ink-2)]">
                      {names.join('・')}
                    </p>
                  ) : null}
                  {s.note ? (
                    <p className="mt-1 text-sm text-[var(--ink)]">
                      {s.note}
                    </p>
                  ) : null}
                </li>
              )
            })
          )}
        </ul>
      </section>
    </main>
  )
}
