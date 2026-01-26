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
    url: '/doc',
    theme: 'purple',
    pageTitle: 'Lydos API Reference',
  })
)

export default app
