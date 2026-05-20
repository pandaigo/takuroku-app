import Link from 'next/link'
import { requireAuth } from '@/lib/supabase/require-auth'
import { createGroup } from './actions'

export default async function NewGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  await requireAuth()
  const sp = await searchParams

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <Link
        href="/"
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← もどる
      </Link>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        新しく綴じる
      </h1>

      {sp.error ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-sm text-[var(--vermilion-deep)]"
        >
          {sp.error}
        </p>
      ) : null}

      <form action={createGroup} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          卓名 <span className="text-[var(--vermilion)]">＊</span>
          <input
            name="name"
            required
            placeholder="例 金曜クトゥルフ卓"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          種別
          <select
            name="category"
            defaultValue="trpg"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          >
            <option value="trpg">TRPG卓</option>
            <option value="mystery">マダミス卓</option>
            <option value="werewolf">人狼会</option>
            <option value="boardgame">ボドゲ会</option>
            <option value="other">その他</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          システム名（任意）
          <input
            name="system_name"
            placeholder="例 クトゥルフ神話TRPG"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          結成日（任意）
          <input
            name="started_on"
            type="date"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          ひとこと紹介（任意・勧誘カードに出ます）
          <textarea
            name="blurb"
            rows={2}
            maxLength={200}
            placeholder="例 初心者歓迎、月1ペースでまったり"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          連絡先URL（任意・X/Discord/応募フォーム等）
          <input
            name="contact_url"
            type="url"
            inputMode="url"
            placeholder="https://twitter.com/your_handle 等"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
          <span className="text-xs text-[var(--ink-3)]">
            公開URLを発行すると、受け手が「参加希望はこちら」から押せます。
          </span>
        </label>

        <button className="mt-2 self-start border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium tracking-[0.15em] text-[var(--paper)] hover:bg-[var(--ink-2)]">
          綴 じ る
        </button>
      </form>
    </main>
  )
}
