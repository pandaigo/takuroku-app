import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WSL の IP 経由アクセス時、開発用ホットリロードを許可（開発専用・本番無害）。
  allowedDevOrigins: ["172.29.27.110"],
};

export default nextConfig;

// Cloudflare Workers 用：dev 中も bindings/env を有効化（OpenNext adapter）
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
