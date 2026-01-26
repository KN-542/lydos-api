# Lydos API

LydosのバックエンドAPIサーバー

## 技術スタック

- Bun
- Hono
- OpenAPI
- Zod
- Prisma
- PostgreSQL
- Redis
- TypeScript
- Biome

## セットアップ

```bash
bun install
cp .env.example .env

# データベース起動
cd ../lydos-setup
docker compose up -d

# Prismaセットアップ
cd ../lydos-api
bun run db:generate
bun run db:migrate
bun run db:seed

# 開発サーバー起動
bun run dev
```

開発サーバー: `http://127.0.0.1:3001`  
Nginx経由: `https://local.api.lydos`

## スクリプト

```bash
# 開発
bun run dev
bun run build
bun run lint
bun run typecheck

# データベース
bun run db:generate  # Prisma Client生成
bun run db:migrate   # マイグレーション実行
bun run db:push      # スキーマ直接反映
bun run db:seed      # マスタデータ投入
bun run db:studio    # Prisma Studio起動
```

## APIエンドポイント

### GET /api/message
クエリパラメータのメッセージをエコー

### POST /api/message
メッセージをRedisに保存

### GET /api/sites
媒体マスタ全取得

### GET /doc
OpenAPI仕様

### GET /reference
Scalar API Reference UI
