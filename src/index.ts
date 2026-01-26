import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { z } from 'zod'

const app = new OpenAPIHono()

// ルートエンドポイント（サンプル）
app.openapi(
  {
    method: 'get',
    path: '/',
    tags: ['General'],
    summary: 'Hello API',
    description: 'APIの動作確認用エンドポイント',
    responses: {
      200: {
        description: 'Success response',
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
              timestamp: z.string(),
            }),
          },
        },
      },
    },
  },
  (c) => {
    return c.json({
      message: 'Hello Hono!',
      timestamp: new Date().toISOString(),
    })
  }
)

// OpenAPI仕様のJSONエンドポイント
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Lydos API',
    description: 'Lydos API のドキュメント',
  },
})

// Scalar UIでAPIリファレンスを表示
app.get(
  '/reference',
  Scalar({
    url: './doc', // 相対パスにすることでnginxのプロキシ経由でも正しく動作
    theme: 'purple',
    pageTitle: 'Lydos API Reference',
  })
)

// サーバーの起動
const port = process.env.PORT || 3001
const hostname = process.env.HOSTNAME || '127.0.0.1'

console.log(`🚀 Server is running on http://127.0.0.1:${port}`)

export default {
  port,
  hostname,
  fetch: app.fetch,
}
