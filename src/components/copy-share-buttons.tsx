'use client'

import { useState } from 'react'

// 公開URLのコピー＆Web Share。スマホ完結の共有導線として必須。
export function CopyShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 失敗時は手動コピー可能なフォールバックとしてプロンプト表示
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
      // Web Share未対応端末はコピーで代替
      await copy()
    }
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copy}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {copied ? 'コピーしました' : 'URLをコピー'}
      </button>
      <button
        type="button"
        onClick={share}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        共有…
      </button>
    </div>
  )
}
