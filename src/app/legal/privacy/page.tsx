import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: '卓録の個人情報の取り扱い',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:py-12">
      <nav className="text-sm text-[var(--ink-2)]">
        <Link href="/" className="hover:text-[var(--ink)]">
          卓録トップ
        </Link>
        <span className="mx-2 text-[var(--rule)]">／</span>
        <Link href="/legal" className="hover:text-[var(--ink)]">
          法務
        </Link>
        <span className="mx-2 text-[var(--rule)]">／</span>
        <span className="text-[var(--ink-3)]">プライバシーポリシー</span>
      </nav>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        プライバシーポリシー
      </h1>
      <p className="mt-2 text-xs text-[var(--ink-3)]">最終更新日：2026-05-20</p>

      <article className="mt-6 space-y-6 text-sm leading-relaxed text-[var(--ink)]">
        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            1. 取得する個人情報
          </h2>
          <ul className="chapter-list mt-2 space-y-1 pl-2 text-[var(--ink-2)]">
            <li>登録時：メールアドレス・パスワード（ハッシュ化）・生年（年齢確認）</li>
            <li>利用時：あなたが入力した卓・メンバー・セッション・カード・通報・問い合わせ内容</li>
            <li>利用実態：記録作成・カード閲覧・共有・通報等のイベント（品質改善のため）</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            2. 利用目的
          </h2>
          <ul className="chapter-list mt-2 space-y-1 pl-2 text-[var(--ink-2)]">
            <li>サービスの提供・運用・保守</li>
            <li>本人確認・年齢確認・未成年保護</li>
            <li>通報対応・利用規約の遵守確認</li>
            <li>サービス品質の改善・障害対応</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            3. 第三者提供
          </h2>
          <p className="mt-2 text-[var(--ink-2)]">
            主催が「公開URL」を発行した場合、当該カード（卓名・メンバー名・通算数・名場面等）はログイン無しの第三者に閲覧可能となります。これは主催の明示的な同意操作に基づくものであり、メンバー名の公開には主催が事前に本人の同意を得ていることが前提です。それ以外の第三者提供は、法令に基づく場合を除き行いません。
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            4. 越境転送
          </h2>
          <p className="mt-2 text-[var(--ink-2)]">
            本サービスはクラウド事業者（Supabase 等）を利用しており、データが日本国外に所在するサーバーに保管される可能性があります。利用開始により、当該越境転送について同意いただいたものとみなします。
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            5. 保管期間
          </h2>
          <ul className="chapter-list mt-2 space-y-1 pl-2 text-[var(--ink-2)]">
            <li>あなたの卓・メンバー・記録：退会または個別削除まで</li>
            <li>利用実態ログ：6ヶ月</li>
            <li>通報・対応事務記録：3年</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            6. 開示・訂正・利用停止請求
          </h2>
          <p className="mt-2 text-[var(--ink-2)]">
            本人または当該メンバー本人は、開示・訂正・利用停止・削除を請求できます。受付窓口は{' '}
            <Link
              href="/legal/contact"
              className="border-b border-[var(--vermilion)] text-[var(--vermilion)] hover:text-[var(--vermilion-deep)]"
            >
              問い合わせ窓口
            </Link>
            。応答目安：受領通知5営業日以内／一次回答10営業日以内（緊急3営業日以内）。
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            7. 安全管理措置
          </h2>
          <ul className="chapter-list mt-2 space-y-1 pl-2 text-[var(--ink-2)]">
            <li>技術的：行レベルセキュリティ（RLS）、推測不能トークン、暗号化通信</li>
            <li>組織的：個人運営のため運営者本人のみがアクセス権限を持つ</li>
            <li>物理的：クラウド事業者の安全管理措置に準拠</li>
            <li>人的：運営者は秘密保持義務を負う</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            8. 漏えい等への対応
          </h2>
          <p className="mt-2 text-[var(--ink-2)]">
            個人データの漏えい等の事案が発生した場合、個人情報保護委員会への報告および本人通知を、法令の定めに従って速やかに行います。
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            9. 未成年の保護
          </h2>
          <p className="mt-2 text-[var(--ink-2)]">
            13歳未満は利用できません。13〜17歳のご利用には、保護者の同意確認が必要です。
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-mincho)] text-base font-semibold tracking-[0.1em] text-[var(--ink)]">
            10. 変更
          </h2>
          <p className="mt-2 text-[var(--ink-2)]">
            本ポリシーは必要に応じて改定します。利用者に不利益となる変更は施行30日前までに告知します。
          </p>
        </section>
      </article>
    </main>
  )
}
