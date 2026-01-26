# Lydos API

LydosのバックエンドAPIサーバーです。
Lydosで何を作るかは未定です。
とりあえず現状はHonoフレームワーク練習用

**前提**: PostgreSQL & Redis起動済み（`lydos-setup`で`docker compose up -d`）

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
