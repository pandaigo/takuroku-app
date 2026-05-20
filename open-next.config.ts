import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// 卓録は ISR/incremental cache 未使用のため、キャッシュは無設定で開始。
// 後で必要になれば R2 bucket binding を wrangler.jsonc に追加し、
// r2IncrementalCache をここに渡す。
export default defineCloudflareConfig({})
