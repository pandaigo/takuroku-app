import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { updateComplaintStatus, suspendPublicLink } from './actions'

export const metadata: Metadata = {
  title: '通報管理｜卓録',
  robots: { index: false, follow: false },
}

const REASON_LABEL: Record<string, string> = {
  impersonation: 'なりすまし',
  harassment: '嫌がらせ',
  privacy: 'プライバシー',
  defamation: '名誉毀損',
  illegal: '違法',
  other: 'その他',
}

const TARGET_KIND_LABEL: Record<string, string> = {
  public_link: '公開URLのカード',
  member: 'メンバー名',
  group: '卓そのもの',
  session: 'セッション記録',
  other: 'その他',
}

type Complaint = {
  id: string
  target_kind: string
  target_ref: string
  reporter_email: string | null
  reporter_user_id: string | null
  reason: string
  details: string | null
  status: string
  suspended_at: string | null
  resolved_at: string | null
  created_at: string
}

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{
    updated?: string
    suspended?: string
    error?: string
  }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  if (!authData?.claims) redirect('/login')

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    notFound()
  }

  const { data: complaints } = await supabase.rpc(
    'admin_list_pending_complaints',
  )
  const list = (complaints ?? []) as Complaint[]

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:py-12">
      <Link
        href="/"
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← 卓録トップ
      </Link>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        通報管理（管理者）
      </h1>
      <p className="mt-3 text-xs leading-relaxed text-[var(--ink-2)]">
        保留中（pending / reviewing）の通報を表示。緊急（晒し・なりすまし）は3営業日以内、それ以外は10営業日以内に一次対応。
      </p>

      {sp.error ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-sm text-[var(--vermilion-deep)]"
        >
          {sp.error}
        </p>
      ) : null}
      {sp.updated ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-sm text-[var(--brass)]"
        >
          ステータスを更新しました
        </p>
      ) : null}
      {sp.suspended ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-sm text-[var(--brass)]"
        >
          公開URLを暫定停止しました
        </p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-3">
        {list.length === 0 ? (
          <li className="border-2 border-dashed border-[var(--rule-strong)] bg-[var(--paper)] px-4 py-10 text-center text-sm text-[var(--ink-2)]">
            保留中の通報はありません。
          </li>
        ) : (
          list.map((c) => {
            const isUrgent =
              c.reason === 'impersonation' || c.reason === 'harassment'
            return (
              <li
                key={c.id}
                className="border border-[var(--rule-strong)] bg-[var(--paper)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`border px-2 py-0.5 text-[11px] font-medium ${
                      isUrgent
                        ? 'border-[var(--vermilion)] bg-[rgba(168,50,45,0.06)] text-[var(--vermilion-deep)]'
                        : 'border-[var(--rule)] bg-[var(--paper-2)] text-[var(--ink-2)]'
                    }`}
                  >
                    {isUrgent ? '[緊急] ' : ''}
                    {REASON_LABEL[c.reason] ?? c.reason}
                  </span>
                  <span className="text-xs text-[var(--ink-3)]">
                    {new Date(c.created_at).toLocaleString('ja-JP')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--ink)]">
                  対象：{TARGET_KIND_LABEL[c.target_kind] ?? c.target_kind} /{' '}
                  <code className="break-all border border-[var(--rule)] bg-[var(--paper-2)] px-1 font-mono text-xs">
                    {c.target_ref}
                  </code>
                </p>
                {c.details ? (
                  <p className="mt-2 whitespace-pre-wrap border border-[var(--rule)] bg-[var(--paper-2)] p-2 text-xs text-[var(--ink-2)]">
                    {c.details}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--ink-3)]">
                  申立者メール：{c.reporter_email ?? '(なし)'}
                  {c.reporter_user_id ? ' / ログイン申立' : ''}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-3)]">
                  ステータス：{c.status}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={suspendPublicLink}>
                    <input type="hidden" name="token" value={c.target_ref} />
                    <input type="hidden" name="complaint_id" value={c.id} />
                    <button className="border border-[var(--vermilion)] bg-[var(--paper)] px-3 py-1 text-xs font-medium text-[var(--vermilion)] hover:bg-[rgba(168,50,45,0.06)]">
                      公開URLを暫定停止
                    </button>
                  </form>
                  <form action={updateComplaintStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="reviewing" />
                    <button className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-1 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--paper-2)]">
                      確認中にする
                    </button>
                  </form>
                  <form action={updateComplaintStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input
                      type="hidden"
                      name="status"
                      value="resolved_remove"
                    />
                    <button className="border-2 border-[var(--vermilion)] bg-[var(--vermilion)] px-3 py-1 text-xs font-medium text-[var(--paper)] hover:bg-[var(--vermilion-deep)]">
                      対応済：削除
                    </button>
                  </form>
                  <form action={updateComplaintStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="resolved_keep" />
                    <button className="border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-1 text-xs font-medium text-[var(--brass)] hover:bg-[rgba(139,105,20,0.12)]">
                      対応済：維持
                    </button>
                  </form>
                  <form action={updateComplaintStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="dismissed" />
                    <button className="border border-[var(--rule)] bg-[var(--paper)] px-3 py-1 text-xs font-medium text-[var(--ink-3)] hover:bg-[var(--paper-2)]">
                      却下
                    </button>
                  </form>
                </div>
              </li>
            )
          })
        )}
      </ul>
    </main>
  )
}
