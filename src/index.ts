import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { z } from 'zod'

const app = new OpenAPIHono()

// CORSを有効にする
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN as string,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

// メッセージレスポンススキーマ
const messageResponseSchema = z.object({
  message: z.string().openapi({ example: 'Hello, Lydos!' }),
  timestamp: z.string().openapi({ example: '2026-01-27T12:00:00.000Z' }),
})

// GET: メッセージ取得API
const messageQuerySchema = z.object({
  message: z.string().optional().openapi({ example: 'こんにちは' }),
})

app.openapi(
  {
    method: 'get',
    path: '/api/message',
    tags: ['Message'],
    summary: 'メッセージ取得',
    description: 'クエリパラメータのメッセージをエコーします',
    request: {
      query: messageQuerySchema,
    },
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: messageResponseSchema,
          },
        },
      },
    },
  },
  (c) => {
    const { message } = c.req.valid('query')
    return c.json({
      message: message || 'メッセージが指定されていません（GET）',
      timestamp: new Date().toISOString(),
    })
  }
)

// POST: メッセージエコーAPI
const messageRequestSchema = z.object({
  message: z.string().openapi({ example: 'Hello, Lydos!' }),
})

app.openapi(
  {
    method: 'post',
    path: '/api/message',
    tags: ['Message'],
    summary: 'メッセージエコー',
    description: '送信されたメッセージをそのまま返します',
    request: {
      body: {
        content: {
          'application/json': {
            schema: messageRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: messageResponseSchema,
          },
        },
      },
    },
  },
  (c) => {
    const body = c.req.valid('json')
    return c.json({
      message: body.message,
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
  },
})

// サーバーの起動
const port = process.env.PORT || 3001
const hostname = process.env.HOSTNAME || '127.0.0.1'
console.log(`🚀 Server is running on http://${hostname}:${port}`)

export default {
  port,
  hostname,
  fetch: app.fetch,
}
