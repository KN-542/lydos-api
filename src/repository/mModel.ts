import type { Prisma, PrismaClient } from '@prisma/client'
import type { IMModelRepository } from '../domain/interface/mModel'
import { MModelEntity } from '../domain/model/mModel'

export class MModelRepository implements IMModelRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // ユーザーのプランで利用可能なモデル一覧取得
  async findAllByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<MModelEntity[]> {
    const models = await tx.mModel.findMany({
      where: {
        planModels: {
          some: {
            plan: {
              users: { some: { authId } },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    })
    return models.map(
      (m) => new MModelEntity(m.id, m.name, m.modelId, m.provider, m.color, m.isDefault)
    )
  }

  // 取得
  async find(tx: Prisma.TransactionClient, id: number): Promise<MModelEntity | null> {
    const m = await tx.mModel.findUnique({ where: { id } })
    if (m === null) return null
    return new MModelEntity(m.id, m.name, m.modelId, m.provider, m.color, m.isDefault)
  }
}
