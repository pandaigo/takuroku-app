'use client'

// 大人数モード：fieldset 内の checkbox を一括ON/OFF。
// 引数 fieldsetId と一致する <fieldset id={...}> 内のチェックボックスを操作する。
export function AttendeeBulkToggle({ fieldsetId }: { fieldsetId: string }) {
  const setAll = (checked: boolean) => {
    const root = document.getElementById(fieldsetId)
    if (!root) return
    root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(
      (el) => {
        el.checked = checked
      },
    )
  }

  return (
    <div className="flex gap-2 text-xs">
      <button
        type="button"
        onClick={() => setAll(true)}
        className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        全員を選択
      </button>
      <button
        type="button"
        onClick={() => setAll(false)}
        className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        クリア
      </button>
    </div>
  )
}
