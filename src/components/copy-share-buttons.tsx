'use client'

import { useState } from 'react'

// 公開URLのコピー＋Web Share＋X 投稿テンプレ（Pro 機能 #2）。
// スマホ完結の共有導線として必須。
export function CopyShareButtons({
  url,
  title,
  xText,
}: {
  url: string
  title: string
  xText?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('URLをコピーしてください', url)
    }
  }

  const share = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ url, title })
      } catch {
        // ユーザーキャンセル等は静かに無視
      }
    } else {
      await copy()
    }
  }

  // X (旧 Twitter) Web Intent：API key 不要。テンプレ文＋URL を渡してユーザーが投稿ボタンを押すだけ。
  const intentText = xText ?? `${title}\n卓年鑑カードを公開しました`
  const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    intentText,
  )}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent('卓録')}`

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copy}
        className="border-2 border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-sm font-medium tracking-[0.05em] text-[var(--paper)] hover:bg-[var(--ink-2)]"
      >
        {copied ? 'コピーしました' : 'URLをコピー'}
      </button>
      <a
        href={xIntentUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]"
        aria-label="X に投稿（新しいタブで開く）"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          aria-hidden
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X に投稿
      </a>
      <button
        type="button"
        onClick={share}
        className="border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]"
      >
        共有…
      </button>
    </div>
  )
}
