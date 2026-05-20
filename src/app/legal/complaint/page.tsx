import Link from 'next/link'
import type { Metadata } from 'next'
import { submitComplaint } from './actions'

export const metadata: Metadata = {
  title: '通報・異議申立｜卓録',
  description:
    '卓録の公開カードや記載内容について、なりすまし・嫌がらせ・プライバシー侵害・名誉毀損・違法等の通報を受け付けます。',
  robots: { index: false, follow: false },
}

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'impersonation', label: 'なりすまし・偽の卓' },
  { value: 'harassment', label: '嫌がらせ・勝手な実名登録' },
  { value: 'privacy', label: 'プライバシー侵害' },
  { value: 'defamation', label: '名誉毀損・中傷' },
  { value: 'illegal', label: '違法情報' },
  { value: 'other', label: 'その他' },
]

export default async function ComplaintPage({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string
    kind?: string
    reason?: string
    submitted?: string
    error?: string
  }>
}) {
  const sp = await searchParams
  const defaultTargetRef = sp.ref ?? ''
  const ALLOWED_KIND = ['public_link', 'member', 'group', 'session', 'other']
  const defaultTargetKind = ALLOWED_KIND.includes(sp.kind ?? '')
    ? (sp.kind as string)
    : sp.ref?.startsWith('/c/')
      ? 'public_link'
      : 'other'
  const ALLOWED_REASON = [
    'impersonation',
    'harassment',
    'privacy',
    'defamation',
    'illegal',
    'other',
  ]
  const defaultReason = ALLOWED_REASON.includes(sp.reason ?? '')
    ? (sp.reason as string)
    : 'harassment'

  if (sp.submitted) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-2xl md:py-12">
        <h1 className="border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
          通報を受け付けました
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-[var(--ink)]">
          内容を確認し、緊急性が高い場合は3営業日以内、それ以外は10営業日以内に一次対応します。必要に応じて該当の公開URLは一時的に閲覧停止になります。
        </p>
        <p className="mt-3 text-xs text-[var(--ink-3)]">
          ご連絡先メールを記入いただいた場合は、対応結果をご連絡します。
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          ← 卓録トップへ
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 md:max-w-2xl md:py-12">
      <Link
        href="/"
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← 卓録トップへ
      </Link>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        通報・異議申立
      </h1>
      <p className="mt-5 text-sm leading-relaxed text-[var(--ink-2)]">
        卓録の公開カードや記載内容について、なりすまし・嫌がらせ・実名の勝手な掲載・プライバシー侵害・名誉毀損・違法な内容などがある場合に通報できます。
        <strong className="text-[var(--ink)]">ログインは不要</strong>です。第三者代理での申立も受け付けます。
      </p>

      {sp.error ? (
        <p
          aria-live="polite"
          className="mt-4 border border-[var(--vermilion)] bg-[rgba(168,50,45,0.05)] px-3 py-2 text-sm text-[var(--vermilion-deep)]"
        >
          {sp.error}
        </p>
      ) : null}

      <form action={submitComplaint} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          対象の種別
          <select
            name="target_kind"
            defaultValue={defaultTargetKind}
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          >
            <option value="public_link">公開URLのカード</option>
            <option value="member">メンバー名の記載</option>
            <option value="group">卓そのもの</option>
            <option value="session">セッション記録の内容</option>
            <option value="other">その他</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          対象のURLまたは識別情報
          <input
            name="target_ref"
            defaultValue={defaultTargetRef}
            placeholder="例 /c/abc123xyz"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          理由
          <select
            name="reason"
            required
            defaultValue={defaultReason}
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          >
            {REASON_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          詳細（具体的に・4000文字以内）
          <textarea
            name="details"
            rows={6}
            placeholder="どの記載が問題か／自分との関係／その他"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-2)]">
          連絡先メール（任意・対応結果連絡用）
          <input
            type="email"
            name="reporter_email"
            placeholder="任意"
            autoComplete="email"
            spellCheck={false}
            inputMode="email"
            className="border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
        </label>

        <button className="self-start border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium tracking-[0.15em] text-[var(--paper)] hover:bg-[var(--ink-2)]">
          通報を送信
        </button>
      </form>

      <p className="mt-6 text-xs text-[var(--ink-3)]">
        通報内容は確認後、緊急性に応じて該当の公開URLを一時的に閲覧停止することがあります。虚偽の通報は禁止されています。
      </p>
    </main>
  )
}
