import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/require-auth'
import { importSessions } from './actions'

const SAMPLE = `日付,タイトル,出席者,メモ,結果
2024-10-15,獄門の館,あおい・はる・なつ,KP初挑戦,
2024-11-02,禁断の医学,あおい・はる・ふゆ・なつ,初の正気度0,cleared
2024-12-01,時計仕掛けの夢,あおい・はる,新キャラ作成,ongoing`

export default async function ImportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    inserted?: string
    failed?: string
    errors?: string
    error?: string
  }>
}) {
  const { id } = await params
  const sp = await searchParams
  await requireAuth()

  const supabase = await createClient()
  const { data: group } = await supabase
    .from('groups')
    .select('id, name, category')
    .eq('id', id)
    .single()
  if (!group) notFound()

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Link
        href={`/groups/${id}`}
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← {group.name} にもどる
      </Link>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        過去の記録を一括投入
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">
        Excel や Google スプレッドシートからコピペで、過去の卓セッションを一気に取り込みます。続けてきた卓ほど早く「顔」になります。
      </p>

      {sp.inserted ? (
        <div
          aria-live="polite"
          className="mt-5 border border-[var(--brass)] bg-[rgba(139,105,20,0.06)] px-3 py-2 text-sm"
        >
          <p className="text-[var(--brass)]">
            <strong>{sp.inserted} 件</strong>を記録しました。
          </p>
          {sp.failed ? (
            <p className="mt-1 text-xs text-[var(--vermilion-deep)]">
              {sp.failed} 件は形式が合わず取り込めませんでした。
            </p>
          ) : null}
          {sp.errors ? (
            <p className="mt-1 whitespace-pre-line break-all text-xs text-[var(--ink-3)]">
              {sp.errors.replace(/ \/ /g, '\n')}
            </p>
          ) : null}
          <p className="mt-2 text-xs">
            <Link
              href={`/groups/${id}`}
              className="border-b border-[var(--vermilion)] text-[var(--vermilion)] hover:text-[var(--vermilion-deep)]"
            >
              {group.name} にもどって確認する →
            </Link>
          </p>
        </div>
      ) : null}
      {sp.error ? (
        <p
          aria-live="polite"
          className="mt-5 border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-sm text-[var(--vermilion-deep)]"
        >
          {sp.error}
        </p>
      ) : null}

      <section className="mt-6">
        <h2 className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink-2)]">
          フ ォ ー マ ッ ト
        </h2>
        <ul className="chapter-list mt-2 space-y-0.5 pl-2 text-xs leading-relaxed text-[var(--ink)]">
          <li>列順は <strong>日付 / タイトル / 出席者 / メモ / 結果</strong>（5 列）</li>
          <li>日付は <code className="bg-[var(--paper-2)] px-1">YYYY-MM-DD</code> 形式</li>
          <li>出席者は <code className="bg-[var(--paper-2)] px-1">・</code> や <code className="bg-[var(--paper-2)] px-1">,</code> で区切る（未登録は自動で作成）</li>
          <li>結果は <code className="bg-[var(--paper-2)] px-1">cleared</code> / <code className="bg-[var(--paper-2)] px-1">ongoing</code> / <code className="bg-[var(--paper-2)] px-1">tpk</code> または空</li>
          <li>1 行目に列名が入っていても自動でスキップ。1 回 500 行まで</li>
        </ul>
        <details className="mt-3 border border-[var(--rule)] px-3 py-2 text-xs text-[var(--ink-2)]">
          <summary className="cursor-pointer">サンプル CSV を見る</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre bg-[var(--paper-2)] p-3 font-mono text-[var(--ink)]">{SAMPLE}</pre>
        </details>
      </section>

      <form action={importSessions} className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="group_id" value={id} />
        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          CSV テキスト
          <textarea
            name="csv"
            required
            rows={12}
            spellCheck={false}
            placeholder={SAMPLE}
            className="border border-[var(--rule-strong)] bg-[var(--paper)] p-3 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>
        <button className="self-start border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium tracking-[0.15em] text-[var(--paper)] hover:bg-[var(--ink-2)]">
          一 括 投 入
        </button>
      </form>

      <p className="mt-6 text-xs text-[var(--ink-3)]">
        投入された記録は通常の記録と同じ扱いです。誤りがあれば卓ページの履歴から個別に削除できます。
      </p>
    </main>
  )
}
