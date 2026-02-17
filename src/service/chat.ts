import type { PrismaClient } from '@prisma/client'
import type { IMModelRepository } from '../domain/interface/mModel'
import type { ITChatHistoryRepository } from '../domain/interface/tChatHistory'
import type { ITChatSessionRepository } from '../domain/interface/tChatSession'
import type { ITUserRepository } from '../domain/interface/tUser'
import { CreateMessageVO } from '../domain/model/tChatHistory'
import { CreateSessionVO, SessionVO, UpdateSessionVO } from '../domain/model/tChatSession'
import { AppError } from '../lib/error'
import { streamChat } from '../lib/llm'
import type { CreateSessionRequestDTO } from './dto/request/chat/createSession'
import type { DeleteSessionRequestDTO } from './dto/request/chat/deleteSession'
import type { GetMessagesRequestDTO } from './dto/request/chat/getMessages'
import type { GetSessionsRequestDTO } from './dto/request/chat/getSessions'
import type { StreamMessageRequestDTO } from './dto/request/chat/streamMessage'
import { CreateSessionResponseDTO } from './dto/response/chat/createSession'
import { GetMessagesResponseDTO } from './dto/response/chat/getMessages'
import { GetModelsResponseDTO } from './dto/response/chat/getModels'
import { GetSessionsResponseDTO } from './dto/response/chat/getSessions'
import { StreamMessageResponseDTO } from './dto/response/chat/streamMessage'

export class ChatService {
  readonly modelRepository: IMModelRepository
  readonly chatSessionRepository: ITChatSessionRepository
  readonly chatHistoryRepository: ITChatHistoryRepository
  readonly userRepository: ITUserRepository
  readonly prisma: PrismaClient

  constructor(
    modelRepository: IMModelRepository,
    chatSessionRepository: ITChatSessionRepository,
    chatHistoryRepository: ITChatHistoryRepository,
    userRepository: ITUserRepository,
    prisma: PrismaClient
  ) {
    this.modelRepository = modelRepository
    this.chatSessionRepository = chatSessionRepository
    this.chatHistoryRepository = chatHistoryRepository
    this.userRepository = userRepository
    this.prisma = prisma
  }

  /**
   * モデル一覧取得
   */
  async getModels(): Promise<GetModelsResponseDTO> {
    try {
      const entities = await this.prisma.$transaction(async (tx) => {
        return await this.modelRepository.findAll(tx)
      })
      return new GetModelsResponseDTO(entities)
    } catch (error) {
      console.error('Error in ChatService.getModels:', error)
      throw error
    }
  }

  /**
   * セッション一覧取得
   */
  async getSessions(dto: GetSessionsRequestDTO): Promise<GetSessionsResponseDTO> {
    try {
      const entities = await this.prisma.$transaction(async (tx) => {
        return await this.chatSessionRepository.findAllByAuthId(tx, dto.authId)
      })
      return new GetSessionsResponseDTO(entities)
    } catch (error) {
      console.error('Error in ChatService.getSessions:', error)
      throw error
    }
  }

  /**
   * メッセージ一覧取得
   */
  async getMessages(dto: GetMessagesRequestDTO): Promise<GetMessagesResponseDTO> {
    try {
      const entities = await this.prisma.$transaction(async (tx) => {
        const vo = new SessionVO(dto.authId, dto.sessionId)
        return await this.chatHistoryRepository.findMany(tx, vo)
      })
      return new GetMessagesResponseDTO(entities)
    } catch (error) {
      console.error('Error in ChatService.getMessages:', error)
      throw error
    }
  }

  /**
   * チャットセッション作成
   */
  async createSession(dto: CreateSessionRequestDTO): Promise<CreateSessionResponseDTO> {
    try {
      const entity = await this.prisma.$transaction(async (tx) => {
        // ユーザー取得
        const user = await this.userRepository.findByAuthId(tx, dto.authId)
        if (user === null) throw new AppError('ユーザーが見つかりません', 401)

        // モデル取得
        const model = await this.modelRepository.find(tx, dto.modelId)
        if (model === null) throw new AppError('指定されたモデルが見つかりません', 400)

        // セッション作成
        const vo = new CreateSessionVO(user.userId, dto.modelId, dto.title)
        return await this.chatSessionRepository.create(tx, vo)
      })
      return new CreateSessionResponseDTO(entity)
    } catch (error) {
      console.error('Error in ChatService.createSession:', error)
      throw error
    }
  }

  /**
   * チャットセッション削除
   */
  async deleteSession(dto: DeleteSessionRequestDTO): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const vo = new SessionVO(dto.authId, dto.sessionId)
        await this.chatSessionRepository.delete(tx, vo)
      })
    } catch (error) {
      console.error('Error in ChatService.deleteSession:', error)
      throw error
    }
  }

  /**
   * メッセージ送信 (SSEストリーミング)
   */
  async streamMessage(
    dto: StreamMessageRequestDTO,
    onToken: (token: string) => Promise<void>
  ): Promise<StreamMessageResponseDTO> {
    try {
      const sessionVO = new SessionVO(dto.authId, dto.sessionId)

      // 1. セッション取得 + 会話履歴取得 + ユーザーメッセージ保存
      // モデルはセッション作成時に DB へ固定されるため、UI 上でモデルを変更しても
      // 既存セッションの使用モデルには影響しない（新規セッション作成時のみ反映）
      const { model, history } = await this.prisma.$transaction(async (tx) => {
        const session = await this.chatSessionRepository.find(tx, sessionVO)
        if (session === null) throw new Error('Session not found')

        // 保存前に取得することで、LLM へ渡す履歴に今回のユーザーメッセージが混入しないようにする
        const historyEntities = await this.chatHistoryRepository.findMany(tx, sessionVO)

        const vo = new CreateMessageVO(dto.sessionId, 'user', dto.content)
        await this.chatHistoryRepository.create(tx, vo)

        return { model: session.model, history: historyEntities }
      })

      // 2. LLM ストリーミング
      const chatMessages = [
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user' as const, content: dto.content },
      ]
      const { content, inputTokens, outputTokens } = await streamChat(
        chatMessages,
        model.modelId,
        model.provider,
        onToken
      )

      // 3. アシスタントメッセージ保存
      const assistantMessage = await this.prisma.$transaction(async (tx) => {
        const vo = new CreateMessageVO(
          dto.sessionId,
          'assistant',
          content,
          inputTokens,
          outputTokens
        )
        const message = await this.chatHistoryRepository.create(tx, vo)
        await this.chatSessionRepository.update(tx, new UpdateSessionVO(dto.sessionId))
        return message
      })

      return new StreamMessageResponseDTO(assistantMessage.id, inputTokens, outputTokens)
    } catch (error) {
      console.error('Error in ChatService.streamMessage:', error)
      throw error
    }
  }
}
