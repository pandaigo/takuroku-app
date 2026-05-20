import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, priority: 1.0 },
    { url: `${base}/login`, lastModified: now, priority: 0.9 },
    { url: `${base}/demo`, lastModified: now, priority: 0.8 },
    { url: `${base}/legal`, lastModified: now, priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified: now, priority: 0.3 },
    { url: `${base}/legal/privacy`, lastModified: now, priority: 0.3 },
    { url: `${base}/legal/contact`, lastModified: now, priority: 0.3 },
    { url: `${base}/legal/status`, lastModified: now, priority: 0.3 },
  ]
}
