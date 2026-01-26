# Lydos API

LydosのバックエンドAPIサーバー

## 技術スタック

- **Bun** - JavaScriptランタイム
- **Hono** - Webフレームワーク
- **OpenAPI** - API仕様定義
- **Zod** - スキーマバリデーション
- **TypeScript** - 型安全な開発
- **Biome** - フォーマッター & リンター
- **Prisma** - ORMとデータベース管理
- **PostgreSQL** - データベース

## セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. 環境変数の設定

```bash
# .env.exampleをコピー
cp .env.example .env

# 必要に応じて.envを編集
```

### 3. データベースのセットアップ

```bash
# PostgreSQL & Redisを起動（lydos-setupディレクトリで）
cd ../lydos-setup
docker compose up -d

# Prisma Clientを生成
cd ../lydos-api
bun run db:generate

# マイグレーションを実行してテーブルを作成
bun run db:migrate

# マスタデータを投入
bun run db:seed
```

### 4. 開発サーバーの起動

```bash
bun run dev
```

開発サーバーは `http://127.0.0.1:3001` で起動します。  
Nginx経由で `https://local.api.lydos` からアクセス可能です。

## スクリプト

### 開発

```bash
# 開発サーバー起動（ホットリロード）
bun run dev

# ビルド
bun run build

# 型チェック
bun run typecheck

# Lint & Format
bun run lint

# Format確認のみ
bun run format:check
```

### データベース（Prisma）

```bash
# スキーマ変更後、マイグレーションファイルを生成してDBに反映
bun run db:migrate

# スキーマをDBに直接反映（マイグレーションファイルなし）
bun run db:push

# Prisma Clientを再生成
bun run db:generate

# マスタデータを投入
bun run db:seed

# Prisma Studio（GUIツール）を起動
bun run db:studio
```

## APIエンドポイント

### メッセージ取得

```http
GET /api/message
```

**レスポンス:**
```json
{
  "message": "Lydos APIからのメッセージです",
  "timestamp": "2026-01-27T12:34:56.789Z"
}
```

### OpenAPI仕様

```http
GET /doc
```

OpenAPI 3.0形式のAPI仕様を取得できます。

## OpenAPI仕様

このAPIはOpenAPI 3.0仕様に準拠しており、フロントエンドで型定義を自動生成できます：

```bash
# フロントエンド側で実行
cd ../lydos-view
bun run generate:api
```

## データベース

### スキーマ

Prismaスキーマは `schema.prisma` に定義されています。

**モデル:**
- `MSite` - 媒体マスタ
- `TCompany` - 法人
- `TUser` - ユーザー

### Seedデータ

`seed.ts` でマスタデータを管理しています。

現在のマスタデータ:
- 媒体マスタ（MSite）: リクナビNEXT、マイナビ、DODA、その他

## ディレクトリ構造

```
.
├── schema.prisma    # Prismaスキーマ定義
├── seed.ts          # マスタデータSeed
├── src/
│   └── index.ts     # アプリケーションエントリーポイント
└── dist/            # ビルド出力
```

## CORS設定

開発環境では全てのオリジンからのアクセスを許可しています。  
本番環境では適切に制限する必要があります。

## 開発環境

- Bun: v1.3.6
- TypeScript: v5.9.3
- ポート: 3001
- ホスト: 127.0.0.1
