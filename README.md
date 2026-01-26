# Lydos API

LydosのバックエンドAPIサーバー

## 技術スタック

- **Bun** - JavaScriptランタイム
- **Hono** - Webフレームワーク
- **OpenAPI** - API仕様定義
- **Zod** - スキーマバリデーション
- **TypeScript** - 型安全な開発
- **Biome** - フォーマッター & リンター

## セットアップ

```bash
# 依存関係のインストール
bun install

# 開発サーバーの起動
bun run dev
```

開発サーバーは `http://127.0.0.1:3001` で起動します。  
Nginx経由で `https://local.api.lydos` からアクセス可能です。

## スクリプト

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

## ディレクトリ構造

```
src/
├── index.ts         # アプリケーションエントリーポイント
└── (routes/)        # 今後のルート定義
```

## CORS設定

開発環境では全てのオリジンからのアクセスを許可しています。  
本番環境では適切に制限する必要があります。

## 開発環境

- Bun: v1.3.6
- TypeScript: v5.9.3
- ポート: 3001
- ホスト: 127.0.0.1
