import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITChatSessionRepository, TChatSessionWithModel } from '../domain/interface/chat'
import type { ChatAuthVO, CreateSessionVO, SessionOwnerVO } from '../domain/model/chat'
import { MModelEntity, TChatSessionCreateEntity, TChatSessionEntity } from '../domain/model/chat'

export class TChatSessionRepository implements ITChatSessionRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async create(
    tx: Prisma.TransactionClient,
    vo: CreateSessionVO
  ): Promise<TChatSessionCreateEntity> {
    const s = await tx.tChatSession.create({
      data: { userId: vo.userId, modelId: vo.modelId, title: vo.title },
      select: { id: true },
    })
    return new TChatSessionCreateEntity(s.id)
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
    vo: SessionOwnerVO
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

  async delete(tx: Prisma.TransactionClient, vo: SessionOwnerVO): Promise<void> {
    await tx.tChatSession.deleteMany({
      where: { id: vo.sessionId, user: { authId: vo.authId } },
    })
  }
}
