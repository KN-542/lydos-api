import type { Prisma, PrismaClient } from '@prisma/client'
import type { ITChatSessionRepository, TChatSessionAggregation } from '../domain/interface/chat'
import { MModelEntity } from '../domain/model/mModel'
import type { CreateSessionVO, SessionVO, UpdateSessionVO } from '../domain/model/tChatSession'
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

  // 全取得
  async findAllByAuthId(
    tx: Prisma.TransactionClient,
    authId: string
  ): Promise<TChatSessionEntity[]> {
    const user = await tx.tUser.findUnique({
      where: { authId },
      select: {
        chatSessions: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            modelId: true,
            model: { select: { name: true } },
          },
        },
      },
    })
    if (user === null) return []

    return user.chatSessions.map(
      (s) => new TChatSessionEntity(s.id, s.title, s.modelId, s.model.name)
    )
  }

  // 取得
  async find(tx: Prisma.TransactionClient, vo: SessionVO): Promise<TChatSessionAggregation | null> {
    // id は @id で一意だが、Prisma の findUnique はリレーションフィルタ（user.authId）と
    // 組み合わせられないため findFirst を使用
    const s = await tx.tChatSession.findFirst({
      where: { id: vo.sessionId, user: { authId: vo.authId } },
      select: {
        id: true,
        title: true,
        modelId: true,
        model: true,
      },
    })
    if (s === null) return null

    const session = new TChatSessionEntity(s.id, s.title, s.modelId, s.model.name)
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

  // 更新
  async update(tx: Prisma.TransactionClient, vo: UpdateSessionVO): Promise<void> {
    await tx.tChatSession.update({
      where: { id: vo.sessionId },
      data: {
        updatedAt: new Date(),
        ...(vo.title !== undefined && { title: vo.title }),
      },
    })
  }

  // 削除
  async delete(tx: Prisma.TransactionClient, vo: SessionVO): Promise<void> {
    await tx.tChatSession.deleteMany({
      where: { id: vo.sessionId, user: { authId: vo.authId } },
    })
  }
}
