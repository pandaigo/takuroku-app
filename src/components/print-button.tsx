'use client'

// Pro 機能 #6 年末 PDF：window.print() で「PDF として保存」を呼ぶ。
// 専用 PDF ライブラリ（jspdf等）を入れずに、ブラウザ標準の印刷ダイアログから
// 「送信先: PDF として保存」を使う方針。globals.css の @media print で
// 卓年鑑カードだけが綺麗に1枚で出るように調整している。
export function PrintButton({
  label = 'PDF にする',
}: {
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--paper-2)]"
      aria-label="このカードを PDF として保存"
    >
      {label}
    </button>
  )
}
