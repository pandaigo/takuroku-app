# 卓録（takuroku）データモデル ― 唯一の真実

TRPG/ボードゲーム会の「**誰と・どれだけ続けてきたか**」＝関係グラフを蓄積する。
ゲーム攻略DBやシナリオDBには寄らない（正規化しない＝大手と競合せず補完）。
非AI・本人入力のみ（第三者コンテンツ取得経路は作らない）。

> 目的: 第一縦切り（テスト用の最小機能）。撤退ライン計測（主催5人 / 8週 / 無催促3回記録 / カード共有・勧誘使用 / 3-of-5）を可能にすることだけがこの設計の仕事。

## 第一縦切りの範囲（これ以外は作らない）
認証 ＋ 卓作成 ＋ メンバー登録（主催が代理・本人登録不要） ＋ セッション記録（10秒で終わる） ＋ 卓年鑑カード自動生成（1枚画像・勧誘にも使える）。
招待リンク／マッチング／自動通知／メンバー本人連携／相互可視は **範囲外**（撤退ライン通過後のみ）。

## テーブル

### profiles（auth.users と 1:1）
- `id uuid PK` → auth.users(id)
- `display_name text`
- サインアップ時トリガ `handle_new_user`（SECURITY DEFINER / `search_path=''` 固定 / 公開スキーマ露出注意 / RPC は revoke）で自動作成。※サウナ版のハードニング知見を継承。

### groups（卓／会）
- `id uuid PK`
- `owner_id uuid` → auth.users（主催）
- `name text`（卓名）
- `category text`（`'trpg' | 'boardgame' | 'other'`。カードの見せ方の出し分け用・決定論的）
- `system_name text null`（例「クトゥルフ神話TRPG」。**自由入力＝正規化しない**＝システムDB化を避ける。サウナの place_name 教訓を継承）
- `started_on date`（結成日。「結成から◯年◯ヶ月」算出の素）
- `blurb text null`（ひとこと紹介。勧誘カード用）
- `created_at timestamptz default now()`

### members（卓のメンバー。主催が代理で足せる＝本人登録不要）
- `id uuid PK`
- `group_id uuid` → groups（ON DELETE CASCADE）
- `display_name text`（名前だけ）
- `role text null`（KP/GM/PL/主催/参加 等。自由入力＝役割は卓ごとに違う）
- `linked_user_id uuid null` → auth.users（将来、本人登録時に紐付け。第一縦切りでは常に null）
- `created_at timestamptz default now()`

### sessions（1回の記録。入力は10秒で終わることを最優先）
- `id uuid PK`
- `group_id uuid` → groups（ON DELETE CASCADE）
- `played_on date`
- `title text`（シナリオ名／ゲーム名。**自由入力＝正規化しない**）
- `note text null`（ひとこと＝名場面）
- `status text null`（TRPG任意: `'cleared' | 'tpk' | 'ongoing'` 等。ボドゲ会は未使用で null）
- `created_by uuid` → auth.users（記録者＝主催）
- `created_at timestamptz default now()`

### session_attendees（その回に誰が来たか）
- `session_id uuid` → sessions（ON DELETE CASCADE）
- `member_id uuid` → members（ON DELETE CASCADE）
- PRIMARY KEY (`session_id`, `member_id`)

### events（撤退ライン計測用・最小ログ。判定を推測でなく事実にする）
- `id uuid PK`
- `user_id uuid` → auth.users
- `group_id uuid null` → groups
- `type text`（`'session_logged' | 'card_viewed' | 'card_exported' | 'card_shared'`）
- `created_at timestamptz default now()`
- 用途: 主催ごとに「無催促セッション記録数（≥3）」と「カード書き出し／共有（必然性シグナル）」を集計。

## 卓年鑑カード（テーブルなし＝集計の派生）
groups＋members＋sessions＋session_attendees から算出して1枚画像に描画:
- 卓名・種別、結成からの期間（`now - started_on`）、通算セッション数、ペース（回数 ÷ 経過月＝「月◯回」）
- メンバーと参加回数（attendees 集計）、直近の名場面ひとこと数件
- 称号（**決定論的・非AI**：通算回数で `0-4 結成 / 5-19 常設卓 / 20-49 歴戦 / 50+ 伝説卓`）
- 勧誘モード（任意トグル）: `blurb` ＋「一緒に遊ぶ人募集中」を併記

## RLS 方針（サウナ版の検証済み方針を継承）
- public 全テーブル RLS 有効。`authenticated` のみ GRANT（anon 不可＝認証必須アプリ）。
- ポリシーは `(select auth.uid())` 形式（行ごと再評価回避）。
- `groups`: `owner_id = (select auth.uid())` で owner が CRUD。
- `members` / `sessions` / `session_attendees`: 親 `groups` の owner に紐づく（owner のみ CRUD）。
- `events`: `user_id = (select auth.uid())` で本人のみ read/insert。
- `user_metadata` を認可判断に使わない。ビューを作る場合は `security_invoker`。

## 範囲外（次段：撤退ライン通過後のみ）
- `invites`（token / inviter / accepted_by）。未登録メンバーをタグ → 招待リンク。
- members 本人連携（`linked_user_id` 紐付け）と相互可視。
- 卓年鑑の年次自動配信（都度通知）。マッチングは恒久的に作らない（BGA等と競合＝目的関数で却下済）。
