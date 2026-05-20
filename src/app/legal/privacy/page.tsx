import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー｜卓録',
  description: '卓録の個人情報の取り扱い',
}

// 注：本ページは要件（D13〜D22）に基づく構造的雛形。法務確認後に確定。

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Link
        href="/legal"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        ← 法務トップへ
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        プライバシーポリシー
      </h1>
      <p className="mt-2 text-xs text-zinc-500">
        最終更新日：2026-05-20（雛形）
      </p>

      <article className="prose prose-sm mt-6 max-w-none text-zinc-800 dark:prose-invert dark:text-zinc-200">
        <h2 className="mt-6 text-base font-semibold">1. 取得する個人情報</h2>
        <ul className="list-disc pl-5">
          <li>登録時に：メールアドレス・パスワード（ハッシュ化保管）・生年（年齢確認用）</li>
          <li>利用に伴って：あなたが入力した卓・メンバー・セッション・カード・通報・問い合わせ内容</li>
          <li>利用実態：記録作成・カード閲覧・共有・通報等のイベント（撤退ライン計測および品質改善の目的）</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold">2. 利用目的</h2>
        <ul className="list-disc pl-5">
          <li>サービスの提供・運用・保守</li>
          <li>本人確認・年齢確認・未成年保護</li>
          <li>通報対応・利用規約の遵守確認</li>
          <li>サービス品質の改善・障害対応</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold">3. 第三者提供</h2>
        <p>
          主催が「公開URL」を発行した場合、当該カード（卓名・メンバー名・通算数・名場面等）はログイン無しの第三者に閲覧可能となります。
          これは主催の明示的な同意操作に基づくものであり、メンバー名の公開には主催が事前に本人の同意を得ていることが前提です。
          それ以外の第三者提供は、法令に基づく場合を除き行いません。
        </p>

        <h2 className="mt-6 text-base font-semibold">4. 越境転送</h2>
        <p>
          本サービスはクラウド事業者（Supabase 等）を利用しており、データが日本国外（例：米国）に所在するサーバーに保管される可能性があります。
          利用開始により、当該越境転送について同意いただいたものとみなします。
        </p>

        <h2 className="mt-6 text-base font-semibold">5. 保管期間</h2>
        <ul className="list-disc pl-5">
          <li>あなたの卓・メンバー・記録：退会または個別削除まで</li>
          <li>利用実態ログ：6ヶ月（雛形・確定値は法務確認後）</li>
          <li>通報・対応事務記録：3年（雛形）</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold">6. 開示・訂正・利用停止請求</h2>
        <p>
          本人または当該メンバー本人は、開示・訂正・利用停止・削除を請求できます。
          受付窓口は <Link href="/legal/contact" className="underline">問い合わせ窓口</Link>。
          応答SLA：受領通知5営業日以内／一次回答10営業日以内（緊急3営業日以内）。
        </p>

        <h2 className="mt-6 text-base font-semibold">7. 安全管理措置</h2>
        <ul className="list-disc pl-5">
          <li>技術的：行レベルセキュリティ（RLS）による認可境界、推測不能トークンによる公開URL、暗号化通信</li>
          <li>組織的：個人運営のため、運営者本人のみがアクセス権限を持つ</li>
          <li>物理的：クラウド事業者の安全管理措置に準拠</li>
          <li>人的：運営者は秘密保持義務を負う</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold">8. 漏えい等への対応</h2>
        <p>
          個人データの漏えい等の事案が発生した場合、個人情報保護委員会への報告および本人通知を、法令の定めに従って速やかに行います。
        </p>

        <h2 className="mt-6 text-base font-semibold">9. 未成年の保護</h2>
        <p>
          13歳未満は利用できません。13〜17歳のご利用には、保護者の同意確認が必要です。
        </p>

        <h2 className="mt-6 text-base font-semibold">10. 変更</h2>
        <p>
          本ポリシーは必要に応じて改定します。利用者に不利益となる変更は施行30日前までに告知します。
        </p>
      </article>
    </main>
  )
}
