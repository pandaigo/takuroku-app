import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Shippori_Mincho } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 和の年鑑帳トーン用の明朝。重さは見出し用に3段
const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// モバイルブラウザの上部バーを紙色に揃える（Next 16 では themeColor は viewport export）
export const viewport: Viewport = {
  themeColor: "#fbf7f0",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "卓録 — 卓・ボドゲ会の記録",
    template: "%s｜卓録",
  },
  description:
    "TRPG卓・マダミス卓・人狼会・ボドゲ会の「誰と・どれだけ続けたか」を記録して、卓年鑑カードにする。",
  applicationName: "卓録",
  openGraph: {
    siteName: "卓録",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${shipporiMincho.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* キーボードユーザー向け：本文へスキップ */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--ink)] focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--paper)] focus:shadow-lg"
        >
          本文へスキップ
        </a>
        <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </div>
        <footer className="mt-16 border-t-2 border-double border-[var(--rule-strong)] px-4 py-8 text-center text-xs text-[var(--ink-2)]">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 hover:opacity-80"
            aria-label="卓録トップへ"
          >
            <span className="stamp-sq h-6 w-6 text-[11px]" aria-hidden>
              卓
            </span>
            <span
              translate="no"
              className="font-[family-name:var(--font-mincho)] text-sm font-semibold tracking-[0.2em] text-[var(--ink)]"
            >
              卓 録
            </span>
          </Link>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href="/demo" className="hover:text-[var(--ink)]">
              見本
            </Link>
            <span className="text-[var(--rule)]">／</span>
            <Link href="/legal/operator" className="hover:text-[var(--ink)]">
              運営者
            </Link>
            <span className="text-[var(--rule)]">／</span>
            <Link href="/legal/terms" className="hover:text-[var(--ink)]">
              利用規約
            </Link>
            <span className="text-[var(--rule)]">／</span>
            <Link href="/legal/privacy" className="hover:text-[var(--ink)]">
              プライバシー
            </Link>
            <span className="text-[var(--rule)]">／</span>
            <Link href="/legal/contact" className="hover:text-[var(--ink)]">
              問い合わせ
            </Link>
            <span className="text-[var(--rule)]">／</span>
            <Link href="/legal/complaint" className="hover:text-[var(--ink)]">
              通報窓口
            </Link>
            <span className="text-[var(--rule)]">／</span>
            <Link href="/legal/status" className="hover:text-[var(--ink)]">
              稼働状況
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
