# ===================================
# ビルドステージ
# ===================================
FROM oven/bun:1.3.6-slim AS builder

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json bun.lock ./
COPY schema.prisma ./

# 依存関係をインストール
RUN bun install --frozen-lockfile --production

# Prisma Clientを生成
RUN bunx prisma generate --schema=./schema.prisma

# ソースコードをコピー
COPY src ./src
COPY tsconfig.json ./
COPY biome.json ./

# 型チェック
RUN bun run typecheck

# Lint（--writeなしでチェックのみ）
RUN bunx biome check .

# アプリケーションをビルド
RUN bun run build

# ===================================
# 本番ステージ
# ===================================
FROM oven/bun:1.3.6-slim AS production

WORKDIR /app

# セキュリティ: 非rootユーザーで実行
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs bunuser

# 必要なファイルのみコピー
COPY --from=builder --chown=bunuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bunuser:nodejs /app/dist ./dist
COPY --from=builder --chown=bunuser:nodejs /app/schema.prisma ./
COPY --from=builder --chown=bunuser:nodejs /app/package.json ./

# Prismaマイグレーション用のファイルもコピー（必要に応じて）
COPY --chown=bunuser:nodejs migrations ./migrations
COPY --chown=bunuser:nodejs seed.ts ./seed.ts
COPY --chown=bunuser:nodejs src/lib/master.ts ./src/lib/master.ts

# エントリーポイントスクリプトをコピー
COPY --chown=bunuser:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER bunuser

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

# ポート公開
EXPOSE 3001

# 環境変数
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0

# アプリケーション起動（エントリーポイントスクリプト経由）
ENTRYPOINT ["./docker-entrypoint.sh"]
