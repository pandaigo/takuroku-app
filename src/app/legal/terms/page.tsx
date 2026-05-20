import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約｜卓録',
  description: '卓録サービスの利用規約',
}

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Link
        href="/legal"
        className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        ← 法務トップへ
      </Link>
      <h1 className="mt-4 border-b-2 border-double border-[var(--rule-strong)] pb-3 font-[family-name:var(--font-mincho)] text-xl font-semibold tracking-[0.1em] text-[var(--ink)]">
        利用規約
      </h1>
      <p className="mt-2 text-xs text-[var(--ink-3)]">
        最終更新日：2026-05-20
      </p>

      <article className="prose prose-sm mt-6 max-w-none text-[var(--ink)]">
        <h2 className="mt-6 text-base font-semibold">第1条 サービス概要</h2>
        <p>
          卓録（以下「本サービス」）は、TRPG卓・マダミス卓・人狼会・ボドゲ会等の
          「誰と・どれだけ続けたか」を本人が記録し、卓年鑑カードとして共有できる記録サービスです。
        </p>

        <h2 className="mt-6 text-base font-semibold">第2条 利用条件・禁止事項</h2>
        <ul className="list-disc pl-5">
          <li>本人が入力した自分の活動のみを記録すること</li>
          <li>第三者のコンテンツを取得する経路を一切設けないこと（運営側の義務）</li>
          <li>メンバー名を登録する場合、主催は事前に本人の同意を取得すること</li>
          <li>他人を識別する情報・中傷・違法な内容を自由入力欄に記載しないこと</li>
          <li>なりすまし・公式を騙る表現の禁止</li>
        </ul>

        <h2 className="mt-6 text-base font-semibold">第3条 年齢制限・未成年</h2>
        <p>
          13歳未満は利用できません。13歳以上18歳未満の方は、保護者の同意を得た上でご利用ください。
        </p>

        <h2 className="mt-6 text-base font-semibold">第4条 公開URLとメンバー名</h2>
        <p>
          主催が明示的に公開を選択した場合に限り、卓年鑑カードはログイン無しで閲覧可能な単独URLで公開されます。
          公開には掲載されるメンバー一人ひとりの事前同意取得が必須です。主催はいつでも公開を停止できます。
        </p>

        <h2 className="mt-6 text-base font-semibold">第5条 通報・救済</h2>
        <p>
          なりすまし・嫌がらせ・プライバシー侵害等の通報は
          <Link href="/legal/complaint" className="underline">通報窓口</Link>
          で受け付けます。緊急性が高い案件は3営業日以内、それ以外は10営業日以内に一次対応します。
          虚偽通報は禁止です。
        </p>

        <h2 className="mt-6 text-base font-semibold">第6条 退会とデータ</h2>
        <p>
          利用者は本サービス内から退会できます。退会時、登録された卓・メンバー・記録・公開リンクはすべて削除されます。
          退会前にデータのエクスポートが可能です。
        </p>

        <h2 className="mt-6 text-base font-semibold">第7条 規約の変更</h2>
        <p>
          利用者に不利益となる変更は、施行30日前までに登録メールおよびサービス内で告知します。
        </p>

        <h2 className="mt-6 text-base font-semibold">第8条 サービス終了</h2>
        <p>
          本サービスの終了は、最低60日前までに告知します。告知期間中はデータのエクスポートが可能です。
        </p>

        <h2 className="mt-6 text-base font-semibold">第9条 損害賠償の上限</h2>
        <p>
          運営者の損害賠償の責任は、法令に別段の定めがある場合を除き、利用者が直近1年間に本サービスに支払った対価相当額を上限とします（現在無償提供のため上限は0円）。
        </p>

        <h2 className="mt-6 text-base font-semibold">第10条 準拠法・合意管轄</h2>
        <p>
          本規約は日本法に準拠します。本サービスに関する紛争は、運営者の所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>

        <h2 className="mt-6 text-base font-semibold">第11条 運営者</h2>
        <p>
          本サービスの運営者・連絡先は{' '}
          <Link href="/legal/operator" className="underline">
            運営者情報
          </Link>
          ページに記載しています。
        </p>
      </article>
    </main>
  )
}
