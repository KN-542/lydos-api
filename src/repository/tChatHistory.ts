import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITChatHistoryRepository } from '../domain/interface/chat'
import {
  type CreateMessageVO,
  type FindBySessionVO,
  TChatHistoryEntity,
} from '../domain/model/tChatHistory'

export class TChatHistoryRepository implements ITChatHistoryRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async findBySession(
    tx: Prisma.TransactionClient,
    vo: FindBySessionVO
  ): Promise<TChatHistoryEntity[]> {
    const messages = await tx.tChatHistory.findMany({
      where: { session: { id: vo.sessionId, user: { authId: vo.authId } } },
      orderBy: { createdAt: 'asc' },
    })
    return messages.map(
      (m) =>
        new TChatHistoryEntity(
          m.id,
          m.role as 'user' | 'assistant',
          m.content,
          m.inputTokens,
          m.outputTokens,
          m.createdAt
        )
    )
  }

  async create(tx: Prisma.TransactionClient, vo: CreateMessageVO): Promise<TChatHistoryEntity> {
    const m = await tx.tChatHistory.create({
      data: {
        sessionId: vo.sessionId,
        role: vo.role,
        content: vo.content,
        inputTokens: vo.inputTokens,
        outputTokens: vo.outputTokens,
      },
    })
    return new TChatHistoryEntity(
      m.id,
      m.role as 'user' | 'assistant',
      m.content,
      m.inputTokens,
      m.outputTokens,
      m.createdAt
    )
  }
}
