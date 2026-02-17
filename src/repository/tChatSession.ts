import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITChatSessionRepository, TChatSessionWithModel } from '../domain/interface/chat'
import { MModelEntity } from '../domain/model/mModel'
import type { ChatAuthVO, CreateSessionVO, DeleteSessionVO } from '../domain/model/tChatSession'
import { CreateTChatSessionEntity, TChatSessionEntity } from '../domain/model/tChatSession'

export class TChatSessionRepository implements ITChatSessionRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // 登録
  async create(
    tx: Prisma.TransactionClient,
    vo: CreateSessionVO
  ): Promise<CreateTChatSessionEntity> {
    const s = await tx.tChatSession.create({
      data: { userId: vo.userId, modelId: vo.modelId, title: vo.title },
      select: { id: true },
    })
    return new CreateTChatSessionEntity(s.id)
  }

  async findAll(tx: Prisma.TransactionClient, vo: ChatAuthVO): Promise<TChatSessionEntity[]> {
    const user = await tx.tUser.findUnique({
      where: { authId: vo.authId },
      select: {
        chatSessions: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            modelId: true,
            createdAt: true,
            updatedAt: true,
            model: { select: { name: true } },
          },
        },
      },
    })
    if (user === null) return []

    return user.chatSessions.map(
      (s) =>
        new TChatSessionEntity(s.id, s.title, s.modelId, s.model.name, s.createdAt, s.updatedAt)
    )
  }

  async findWithModel(
    tx: Prisma.TransactionClient,
    vo: DeleteSessionVO
  ): Promise<TChatSessionWithModel | null> {
    const s = await tx.tChatSession.findFirst({
      where: { id: vo.sessionId, user: { authId: vo.authId } },
      select: {
        id: true,
        title: true,
        modelId: true,
        createdAt: true,
        updatedAt: true,
        model: true,
      },
    })
    if (s === null) return null

    const session = new TChatSessionEntity(
      s.id,
      s.title,
      s.modelId,
      s.model.name,
      s.createdAt,
      s.updatedAt
    )
    const model = new MModelEntity(
      s.model.id,
      s.model.name,
      s.model.modelId,
      s.model.provider,
      s.model.color,
      s.model.isDefault
    )
    return { session, model }
  }

  async touchUpdatedAt(tx: Prisma.TransactionClient, sessionId: string): Promise<void> {
    await tx.tChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    })
  }

  // 削除
  async delete(tx: Prisma.TransactionClient, vo: DeleteSessionVO): Promise<void> {
    await tx.tChatSession.deleteMany({
      where: { id: vo.sessionId, user: { authId: vo.authId } },
    })
  }
}
