import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // ログイン必須・私的領域・APIはクロール禁止
        disallow: ['/account', '/api', '/groups'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
