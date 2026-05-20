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

  // 管理者判定（is_admin RPC）
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    // 管理者でない場合は 404 扱い
    notFound()
  }

  const { data: complaints } = await supabase.rpc(
    'admin_list_pending_complaints',
  )
  const list = (complaints ?? []) as Complaint[]

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← 卓録トップ
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        通報管理（管理者）
      </h1>
      <p className="mt-1 text-xs text-zinc-500">
        保留中（pending / reviewing）の通報を表示。緊急（晒し・なりすまし）は3営業日以内、それ以外は10営業日以内に一次対応。
      </p>

      {sp.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {sp.error}
        </p>
      ) : null}
      {sp.updated ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          ステータスを更新しました
        </p>
      ) : null}
      {sp.suspended ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          公開URLを暫定停止しました
        </p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-3">
        {list.length === 0 ? (
          <li className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
            保留中の通報はありません。
          </li>
        ) : (
          list.map((c) => {
            const isUrgent =
              c.reason === 'impersonation' || c.reason === 'harassment'
            return (
              <li
                key={c.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      isUrgent
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {isUrgent ? '[緊急] ' : ''}
                    {REASON_LABEL[c.reason] ?? c.reason}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(c.created_at).toLocaleString('ja-JP')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-50">
                  対象：{TARGET_KIND_LABEL[c.target_kind] ?? c.target_kind} /{' '}
                  <code className="break-all rounded bg-zinc-50 px-1 text-xs dark:bg-zinc-950">
                    {c.target_ref}
                  </code>
                </p>
                {c.details ? (
                  <p className="mt-2 whitespace-pre-wrap rounded bg-zinc-50 p-2 text-xs text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                    {c.details}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-zinc-500">
                  申立者メール：{c.reporter_email ?? '(なし)'}
                  {c.reporter_user_id ? ` / ログイン申立` : ''}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  ステータス：{c.status}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {/* 公開URL暫定停止（target_ref から /c/<token> を抽出） */}
                  <form action={suspendPublicLink}>
                    <input
                      type="hidden"
                      name="token"
                      value={c.target_ref}
                    />
                    <input
                      type="hidden"
                      name="complaint_id"
                      value={c.id}
                    />
                    <button className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">
                      公開URLを暫定停止
                    </button>
                  </form>
                  <form action={updateComplaintStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="reviewing" />
                    <button className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
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
                    <button className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                      対応済：削除
                    </button>
                  </form>
                  <form action={updateComplaintStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input
                      type="hidden"
                      name="status"
                      value="resolved_keep"
                    />
                    <button className="rounded-full border border-emerald-400 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950">
                      対応済：維持
                    </button>
                  </form>
                  <form action={updateComplaintStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="dismissed" />
                    <button className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
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
