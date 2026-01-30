import { OpenAPIHono } from '@hono/zod-openapi'
import { PrismaClient } from '@prisma/client'
import { Scalar } from '@scalar/hono-api-reference'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { SettingController } from './controller/setting'
import { middleware } from './middleware'
import { MPlanRepository } from './repository/mPlan'
import { SettingRouter } from './router'
import { SettingService } from './service/setting'

const prisma = new PrismaClient()

// Contextに保存する変数の型を定義
export type AppEnv = {
  Variables: {
    authId: string
  }
}
export type HonoContext = Context<AppEnv>

const app = new OpenAPIHono<AppEnv>()

// DI: 依存性注入
const planRepository = new MPlanRepository(prisma)
const settingService = new SettingService(planRepository)
const settingController = new SettingController(settingService)
const settingRouter = new SettingRouter(settingController)

// CORSを有効にする
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN as string,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

app.use('/*', middleware)

// ルート登録
settingRouter.registerRoutes(app)

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
