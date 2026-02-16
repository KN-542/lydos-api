import type { OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppEnv } from '..'
import type { ChatController } from '../controller/chat'
import { createSessionBodySchema } from '../controller/request/chat/createSession'
import { deleteSessionParamsSchema } from '../controller/request/chat/deleteSession'
import { getMessagesParamsSchema } from '../controller/request/chat/getMessages'
import { createSessionResponseSchema } from '../controller/response/chat/createSession'
import { getMessagesResponseSchema } from '../controller/response/chat/getMessages'
import { getModelsResponseSchema } from '../controller/response/chat/getModels'
import { getSessionsResponseSchema } from '../controller/response/chat/getSessions'

const errorResponseSchema = z.object({ error: z.string() })

export class ChatRouter {
  readonly chatController: ChatController

  constructor(chatController: ChatController) {
    this.chatController = chatController
  }

  registerRoutes(app: OpenAPIHono<AppEnv>) {
    // モデル一覧取得
    app.openapi(
      {
        method: 'get',
        path: '/chat/models',
        tags: ['チャット'],
        summary: 'AIモデル一覧取得',
        description: '利用可能なAIモデルの一覧を取得します',
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: getModelsResponseSchema } },
          },
          500: {
            description: 'Internal Server Error',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
      async (c) => await this.chatController.getModels(c)
    )

    // セッション一覧取得
    app.openapi(
      {
        method: 'get',
        path: '/chat/sessions',
        tags: ['チャット'],
        summary: 'チャットセッション一覧取得',
        description: 'ログインユーザーのチャットセッション一覧を取得します',
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: getSessionsResponseSchema } },
          },
          500: {
            description: 'Internal Server Error',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
      async (c) => await this.chatController.getSessions(c)
    )

    // セッション作成
    app.openapi(
      {
        method: 'post',
        path: '/chat/sessions',
        tags: ['チャット'],
        summary: 'チャットセッション作成',
        description: '新しいチャットセッションを作成します',
        request: {
          body: {
            content: { 'application/json': { schema: createSessionBodySchema } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: { 'application/json': { schema: createSessionResponseSchema } },
          },
          500: {
            description: 'Internal Server Error',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
      async (c) => await this.chatController.createSession(c)
    )

    // メッセージ一覧取得
    app.openapi(
      {
        method: 'get',
        path: '/chat/sessions/{sessionId}/messages',
        tags: ['チャット'],
        summary: 'メッセージ一覧取得',
        description: '指定セッションのメッセージ履歴を取得します',
        request: { params: getMessagesParamsSchema },
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: getMessagesResponseSchema } },
          },
          500: {
            description: 'Internal Server Error',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
      async (c) => await this.chatController.getMessages(c)
    )

    // メッセージ送信 (SSEストリーミング) - app.post を使用
    app.post('/chat/sessions/:sessionId/messages', async (c) => {
      return await this.chatController.streamMessage(c)
    })

    // セッション削除
    app.openapi(
      {
        method: 'delete',
        path: '/chat/sessions/{sessionId}',
        tags: ['チャット'],
        summary: 'チャットセッション削除',
        description: '指定セッションとそのメッセージ履歴をすべて削除します',
        request: { params: deleteSessionParamsSchema },
        responses: {
          204: { description: 'No Content' },
          500: {
            description: 'Internal Server Error',
            content: { 'application/json': { schema: errorResponseSchema } },
          },
        },
      },
      async (c) => await this.chatController.deleteSession(c)
    )
  }
}
