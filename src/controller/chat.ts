import { streamSSE } from 'hono/streaming'
import type { HonoContext } from '..'
import { AppError } from '../lib/error'
import { extractErrorMessage } from '../lib/llm'
import type { ChatService } from '../service/chat'
import { CreateSessionRequestDTO } from '../service/dto/request/chat/createSession'
import { DeleteSessionRequestDTO } from '../service/dto/request/chat/deleteSession'
import { GetMessagesRequestDTO } from '../service/dto/request/chat/getMessages'
import { GetModelsRequestDTO } from '../service/dto/request/chat/getModels'
import { GetSessionsRequestDTO } from '../service/dto/request/chat/getSessions'
import { StreamMessageRequestDTO } from '../service/dto/request/chat/streamMessage'
import { createSessionBodySchema } from './request/chat/createSession'
import { streamMessageBodySchema } from './request/chat/streamMessage'
import { CreateSessionResponse } from './response/chat/createSession'
import { GetMessagesResponse } from './response/chat/getMessages'
import { GetModelsResponse } from './response/chat/getModels'
import { GetSessionsResponse } from './response/chat/getSessions'

export class ChatController {
  readonly chatService: ChatService

  constructor(chatService: ChatService) {
    this.chatService = chatService
  }

  // モデル一覧取得
  async getModels(c: HonoContext) {
    try {
      const authId = c.get('authId')
      const requestDTO = new GetModelsRequestDTO(authId)
      const responseDTO = await this.chatService.getModels(requestDTO)
      return c.json(new GetModelsResponse(responseDTO), 200)
    } catch (error) {
      console.error('Error in ChatController.getModels:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }

  // セッション一覧取得
  async getSessions(c: HonoContext) {
    try {
      const authId = c.get('authId')
      const requestDTO = new GetSessionsRequestDTO(authId)
      const responseDTO = await this.chatService.getSessions(requestDTO)
      return c.json(new GetSessionsResponse(responseDTO), 200)
    } catch (error) {
      console.error('Error in ChatController.getSessions:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }

  // メッセージ一覧取得
  async getMessages(c: HonoContext) {
    try {
      const authId = c.get('authId')
      const { sessionId } = c.req.param()
      const requestDTO = new GetMessagesRequestDTO(authId, sessionId)
      const responseDTO = await this.chatService.getMessages(requestDTO)
      return c.json(new GetMessagesResponse(responseDTO), 200)
    } catch (error) {
      console.error('Error in ChatController.getMessages:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }

  /**
   * チャットセッション作成
   */
  async createSession(c: HonoContext) {
    try {
      const authId = c.get('authId')
      const body = createSessionBodySchema.parse(await c.req.json())
      const requestDTO = new CreateSessionRequestDTO(authId, body.modelId, body.title)
      const responseDTO = await this.chatService.createSession(requestDTO)
      return c.json(new CreateSessionResponse(responseDTO), 201)
    } catch (error) {
      if (error instanceof AppError) {
        if (error.statusCode === 401) return c.json({ error: error.message }, 401)
        return c.json({ error: error.message }, 400)
      }
      console.error('Error in ChatController.createSession:', error)
      return c.json({ error: '予期せぬエラーが発生しました' }, 500)
    }
  }

  /**
   * チャットセッション削除
   */
  async deleteSession(c: HonoContext) {
    try {
      const authId = c.get('authId')
      const { sessionId } = c.req.param()
      const requestDTO = new DeleteSessionRequestDTO(authId, sessionId)
      await this.chatService.deleteSession(requestDTO)
      return c.body(null, 204)
    } catch (error) {
      console.error('Error in ChatController.deleteSession:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }

  // メッセージ送信 (SSEストリーミング)
  async streamMessage(c: HonoContext) {
    const authId = c.get('authId')
    const { sessionId } = c.req.param()
    const { content } = streamMessageBodySchema.parse(await c.req.json())

    const requestDTO = new StreamMessageRequestDTO(authId, sessionId, content)

    return streamSSE(c, async (stream) => {
      try {
        const result = await this.chatService.streamMessage(requestDTO, async (token) => {
          await stream.writeSSE({ data: JSON.stringify({ token }), event: 'token' })
        })
        await stream.writeSSE({
          data: JSON.stringify({
            messageId: result.messageId,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
          }),
          event: 'done',
        })
      } catch (error) {
        console.error('Error in ChatController.streamMessage:', error)
        await stream.writeSSE({
          data: JSON.stringify({
            error: error instanceof Error ? extractErrorMessage(error) : 'Stream failed',
          }),
          event: 'error',
        })
      }
    })
  }
}
