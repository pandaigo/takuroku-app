#!/usr/bin/env node
/**
 * 卓録の OG 画像で使う「固定ラベル文字」だけを subset した woff2 を Google Fonts API から取得。
 * 1.4MB の japanese subset → 数KB 〜 数十KB に圧縮し、Cloudflare Workers Free plan の
 * CPU 制限内で Satori が処理できるサイズにする（次セッション再開タスク #59）。
 *
 * 使い方: `node scripts/download-fonts.mjs`
 * 出力先: public/fonts/shippori-mincho-subset.woff2
 *
 * このスクリプトは build 前に手動 or `npm run prebuild` で実行する想定。
 * 卓名（動的文字）は subset に含まないため、OG 上で日本語表示するのはラベル文字のみ。
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// OG 画像に出す固定ラベル文字
const TEXT_PARTS = [
  // カードヘッダ
  '卓年鑑',
  // 区画ラベル
  '同卓者',
  '名場面',
  '通算開催',
  '継続',
  'ペース',
  '最終開催',
  // カテゴリ
  'TRPG卓',
  'マダミス',
  '人狼会',
  'ボドゲ',
  'その他',
  // 角印一字
  '卓密狼盤録',
  // 称号
  '伝説卓',
  '歴戦',
  '常設卓',
  '結成',
  // 数値単位（数字本体は Geist Mono なので除外）
  '月年ヶ件回',
  // 状態
  '公開停止中',
  // ブランド
  '卓録',
  // 句読点・記号
  '・／',
]

const text = [...new Set(TEXT_PARTS.join(''))].join('')

const url =
  `https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600&display=swap` +
  `&text=${encodeURIComponent(text)}`

// User-Agent によって返ってくる woff2/woff/ttf が変わる。woff2 を返す Chromium 系を装う。
const cssResp = await fetch(url, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  },
})
if (!cssResp.ok) {
  console.error(`Google Fonts CSS fetch failed: ${cssResp.status}`)
  process.exit(1)
}
const css = await cssResp.text()

// Google Fonts API は `src: url(...) format('woff2')` を返す。URL は .woff2 で終わらず
// `?kit=...&v=v17` のようなクエリ付き。format('woff2') の直前の url() を取る。
const match = css.match(/url\((https:\/\/[^)]+)\)\s*format\(['"]woff2['"]\)/)
if (!match) {
  console.error('woff2 URL not found in CSS:\n', css.slice(0, 500))
  process.exit(1)
}
const fontUrl = match[1]

const fontResp = await fetch(fontUrl)
if (!fontResp.ok) {
  console.error(`Font fetch failed: ${fontResp.status}`)
  process.exit(1)
}
const fontData = await fontResp.arrayBuffer()

const outDir = join(process.cwd(), 'public/fonts')
await mkdir(outDir, { recursive: true })
const outFile = join(outDir, 'shippori-mincho-subset.woff2')
await writeFile(outFile, Buffer.from(fontData))

const kb = (fontData.byteLength / 1024).toFixed(1)
console.log(`OK: ${outFile} (${kb} KB, chars=${text.length})`)
console.log(`Characters: ${text}`)
