import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITChatHistoryRepository } from '../domain/interface/tChatHistory'
import { type CreateMessageVO, TChatHistoryEntity } from '../domain/model/tChatHistory'
import type { SessionVO } from '../domain/model/tChatSession'

export class TChatHistoryRepository implements ITChatHistoryRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // 一覧取得
  async findMany(tx: Prisma.TransactionClient, vo: SessionVO): Promise<TChatHistoryEntity[]> {
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

  // 登録
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
