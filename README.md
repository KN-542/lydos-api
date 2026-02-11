# Lydos API

LydosのバックエンドAPIサーバーです。
Honoフレームワークのプロジェクト。

**前提**: PostgreSQL & Redis起動済み（`lydos-setup`で`docker compose up -d`）

## 技術スタック

- **Runtime**: Bun
- **フレームワーク**: Hono + OpenAPI (Zod)
- **データベース**: PostgreSQL (Prisma ORM)
- **キャッシュ**: Redis (ioredis)
- **認証**: Clerk
- **決済**: Stripe
- **リンター/フォーマッター**: Biome

## アーキテクチャ

オニオンアーキテクチャを採用:

```
src/
├── controller/     # コントローラー層
├── service/        # サービス層（ビジネスロジック）
├── repository/     # リポジトリ層（データアクセス）
├── router/         # ルーティング
├── middleware/     # ミドルウェア（認証など）
├── domain/model/   # ドメインモデル
├── lib/            # ユーティリティ（Redis、Zodなど）
└── stripe/         # Stripe関連
```

## データベーススキーマ

- `MPlan` - プランマスタ（無料版/有料版）
- `TUser` - ユーザー情報
- `TStripeCustomer` - Stripe顧客情報
- `TPaymentMethod` - 支払い方法

## セットアップ

```bash
bun install
cp .env.example .env
bun run db:generate
bun run db:migrate
bun run db:seed
bun run dev
```

## 開発

```bash
bun run dev         # 開発サーバー起動
bun run db:migrate  # スキーマ変更時
bun run db:seed     # データリセット時
bun run db:studio   # データ確認
```

## API Reference

開発サーバー起動後、`https://local.api.lydos/reference` でAPI Referenceを確認できます。

### 認証が必要なエンドポイントをテストする

#### 方法1: Networkタブから取得（推奨）

1. フロントエンドでログインする
2. ブラウザのDevTools → Networkタブを開く
3. フロントエンドでAPIリクエストを実行（例：メッセージ取得）
4. NetworkタブでAPIリクエストをクリック → Request Headers から `Authorization` の値全体をコピー
5. API Referenceの Headers に設定：
   - Key: `Authorization`
   - Value: `コピーした値`（`Bearer eyJhb...`の形式になっているはず）

#### 方法2: Consoleから取得

1. フロントエンドでログインする
2. ブラウザのDevTools → Consoleタブで以下を実行：
   ```javascript
   await window.Clerk.session.getToken()
   ```
3. 取得したトークンをコピー
4. API Referenceの Headers に設定：
   - Key: `Authorization`
   - Value: `Bearer <コピーしたトークン>`（**Bearerと半角スペースを忘れずに**）
