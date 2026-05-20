import Link from 'next/link'
import { createGroup } from './actions'

export default async function NewGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← もどる
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        新しい卓を作る
      </h1>

      {sp.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {sp.error}
        </p>
      ) : null}

      <form action={createGroup} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          卓名 <span className="text-red-500">*</span>
          <input
            name="name"
            required
            placeholder="例：金曜クトゥルフ卓"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          種別
          <select
            name="category"
            defaultValue="trpg"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="trpg">TRPG卓</option>
            <option value="mystery">マダミス卓</option>
            <option value="werewolf">人狼会</option>
            <option value="boardgame">ボドゲ会</option>
            <option value="other">その他</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          システム名（任意）
          <input
            name="system_name"
            placeholder="例：クトゥルフ神話TRPG"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          結成日（任意）
          <input
            name="started_on"
            type="date"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          ひとこと紹介（任意・勧誘カードに出ます）
          <textarea
            name="blurb"
            rows={2}
            maxLength={200}
            placeholder="例：初心者歓迎、月1ペースでまったり"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          連絡先URL（任意・X/Discord/応募フォーム等）
          <input
            name="contact_url"
            type="url"
            placeholder="https://twitter.com/your_handle 等"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <span className="text-xs text-zinc-500">
            公開URLを発行すると、受け手が「参加希望はこちら」から押せます。
          </span>
        </label>

        <button className="mt-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          作る
        </button>
      </form>
    </main>
  )
}
