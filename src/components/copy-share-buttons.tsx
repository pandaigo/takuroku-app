'use client'

import { useState } from 'react'

// 公開URLのコピー＆Web Share。スマホ完結の共有導線として必須。
export function CopyShareButtons({
  url,
  title,
}: {
  url: string
  title: string
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

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copy}
        className="border-2 border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-sm font-medium tracking-[0.05em] text-[var(--paper)] hover:bg-[var(--ink-2)]"
      >
        {copied ? 'コピーしました' : 'URLをコピー'}
      </button>
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
