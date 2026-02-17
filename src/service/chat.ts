import type { PrismaClient } from '@prisma/client'
import type {
  IMModelRepository,
  ITChatHistoryRepository,
  ITChatSessionRepository,
} from '../domain/interface/chat'
import type { ITUserRepository } from '../domain/interface/tUser'
import { CreateMessageVO } from '../domain/model/tChatHistory'
import { ChatAuthVO, CreateSessionVO, DeleteSessionVO } from '../domain/model/tChatSession'
import { AppError } from '../lib/error'
import { streamChat } from '../lib/llm'
import type { CreateSessionRequestDTO } from './dto/request/chat/createSession'
import type { DeleteSessionRequestDTO } from './dto/request/chat/deleteSession'
import type { GetMessagesRequestDTO } from './dto/request/chat/getMessages'
import type { GetModelsRequestDTO } from './dto/request/chat/getModels'
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

  async getModels(_dto: GetModelsRequestDTO): Promise<GetModelsResponseDTO> {
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

  async getSessions(dto: GetSessionsRequestDTO): Promise<GetSessionsResponseDTO> {
    try {
      const entities = await this.prisma.$transaction(async (tx) => {
        const vo = new ChatAuthVO(dto.authId)
        return await this.chatSessionRepository.findAll(tx, vo)
      })
      return new GetSessionsResponseDTO(entities)
    } catch (error) {
      console.error('Error in ChatService.getSessions:', error)
      throw error
    }
  }

  async getMessages(dto: GetMessagesRequestDTO): Promise<GetMessagesResponseDTO> {
    try {
      const entities = await this.prisma.$transaction(async (tx) => {
        const vo = new DeleteSessionVO(dto.authId, dto.sessionId)
        return await this.chatHistoryRepository.findBySession(tx, vo)
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
        const model = await this.modelRepository.findById(tx, dto.modelId)
        if (model === null) throw new AppError('指定されたモデルが見つかりません', 400)

        // セッション作成
        const vo = new CreateSessionVO(user.id, dto.modelId, dto.title)
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
        const vo = new DeleteSessionVO(dto.authId, dto.sessionId)
        await this.chatSessionRepository.delete(tx, vo)
      })
    } catch (error) {
      console.error('Error in ChatService.deleteSession:', error)
      throw error
    }
  }

  async streamMessage(
    dto: StreamMessageRequestDTO,
    onToken: (token: string) => Promise<void>
  ): Promise<StreamMessageResponseDTO> {
    try {
      const sessionVO = new DeleteSessionVO(dto.authId, dto.sessionId)

      // 1. セッション + モデル情報 + 会話履歴を取得
      const { model, history } = await this.prisma.$transaction(async (tx) => {
        const sessionWithModel = await this.chatSessionRepository.findWithModel(tx, sessionVO)
        if (sessionWithModel === null) throw new Error('Session not found')

        const historyEntities = await this.chatHistoryRepository.findBySession(tx, sessionVO)
        return { model: sessionWithModel.model, history: historyEntities }
      })

      // 2. ユーザーメッセージを保存
      await this.prisma.$transaction(async (tx) => {
        const vo = new CreateMessageVO(dto.sessionId, 'user', dto.content)
        await this.chatHistoryRepository.create(tx, vo)
      })

      // 3. LLM ストリーミング (トランザクション外)
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

      // 4. アシスタントメッセージを保存
      const assistantMessage = await this.prisma.$transaction(async (tx) => {
        const vo = new CreateMessageVO(
          dto.sessionId,
          'assistant',
          content,
          inputTokens,
          outputTokens
        )
        return await this.chatHistoryRepository.create(tx, vo)
      })

      // 5. セッションの updatedAt を更新
      await this.prisma.$transaction(async (tx) => {
        await this.chatSessionRepository.touchUpdatedAt(tx, dto.sessionId)
      })

      return new StreamMessageResponseDTO(assistantMessage.id, inputTokens, outputTokens)
    } catch (error) {
      console.error('Error in ChatService.streamMessage:', error)
      throw error
    }
  }
}
