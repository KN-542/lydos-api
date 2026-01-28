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
