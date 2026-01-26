import { OpenAPIHono } from '@hono/zod-openapi'
import { PrismaClient } from '@prisma/client'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { redis } from './lib/redis'

const prisma = new PrismaClient()

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

// GET: 媒体マスタ全取得API
const siteResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'リクナビNEXT' }),
  createdAt: z.string().openapi({ example: '2026-01-27T12:00:00.000Z' }),
})

const sitesResponseSchema = z.object({
  sites: z.array(siteResponseSchema).openapi({ example: [] }),
})

app.openapi(
  {
    method: 'get',
    path: '/api/sites',
    tags: ['Site'],
    summary: '媒体マスタ全取得',
    description: '媒体マスタ（m_site）の全データを取得します',
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: sitesResponseSchema,
          },
        },
      },
    },
  },
  async (c) => {
    const sites = await prisma.mSite.findMany({
      orderBy: { id: 'asc' },
    })

    return c.json({
      sites: sites.map((site) => ({
        id: site.id,
        name: site.name,
        createdAt: site.createdAt.toISOString(),
      })),
    })
  }
)

// POST: メッセージ保存API
const messageRequestSchema = z.object({
  message: z.string().openapi({ example: 'Hello, Lydos!' }),
})

const successResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: 'メッセージを保存しました' }),
})

app.openapi(
  {
    method: 'post',
    path: '/api/message',
    tags: ['Message'],
    summary: 'メッセージ保存',
    description: '送信されたメッセージをRedisに保存します',
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
            schema: successResponseSchema,
          },
        },
      },
    },
  },
  async (c) => {
    const body = c.req.valid('json')
    const timestamp = new Date().toISOString()
    const key = `message:${timestamp}`

    // Redisに保存
    await redis.set(key, JSON.stringify({ message: body.message, timestamp }))
    await redis.expire(key, 3600) // 1時間後に自動削除

    return c.json({
      success: true,
      message: 'メッセージを保存しました',
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

// Scalar UIでAPIリファレンスを表示
app.get(
  '/reference',
  Scalar({
    url: '/doc', // 相対パスにすることでnginxのプロキシ経由でも正しく動作
    theme: 'purple',
    pageTitle: 'Lydos API Reference',
  })
)

// サーバーの起動
const port = process.env.PORT || 3001
const hostname = process.env.HOSTNAME || '127.0.0.1'
console.log(`🚀 Server is running on http://${hostname}:${port}`)

export default {
  port,
  hostname,
  fetch: app.fetch,
}
