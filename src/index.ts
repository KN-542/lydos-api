import { OpenAPIHono } from '@hono/zod-openapi'
import { PrismaClient } from '@prisma/client'
import { Scalar } from '@scalar/hono-api-reference'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { ChatController } from './controller/chat'
import { SettingController } from './controller/setting'
import { createMiddleware } from './middleware'
import { MModelRepository } from './repository/mModel'
import { MPlanRepository } from './repository/mPlan'
import { TChatHistoryRepository } from './repository/tChatHistory'
import { TChatSessionRepository } from './repository/tChatSession'
import { TStripeCustomerRepository } from './repository/tStripeCustomer'
import { TUserRepository } from './repository/tUser'
import { SettingRouter } from './router'
import { ChatRouter } from './router/chatRouter'
import { ChatService } from './service/chat'
import { SettingService } from './service/setting'
import { StripeRepository } from './stripe'

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
const stripeRepository = new StripeRepository()
const tStripeCustomerRepository = new TStripeCustomerRepository(prisma)
const tUserRepository = new TUserRepository(prisma)
const settingService = new SettingService(
  planRepository,
  stripeRepository,
  tStripeCustomerRepository,
  tUserRepository,
  prisma
)
const settingController = new SettingController(settingService)
const settingRouter = new SettingRouter(settingController)

const modelRepository = new MModelRepository(prisma)
const chatSessionRepository = new TChatSessionRepository(prisma)
const chatHistoryRepository = new TChatHistoryRepository(prisma)
const chatService = new ChatService(
  modelRepository,
  chatSessionRepository,
  chatHistoryRepository,
  prisma
)
const chatController = new ChatController(chatService)
const chatRouter = new ChatRouter(chatController)

// CORSを有効にする
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN as string,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

app.use('/*', createMiddleware(prisma))

// ルート登録
settingRouter.registerRoutes(app)
chatRouter.registerRoutes(app)

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
