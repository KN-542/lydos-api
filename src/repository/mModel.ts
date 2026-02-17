import type { Prisma, PrismaClient } from '@prisma/client'
import type { IMModelRepository } from '../domain/interface/chat'
import { MModelEntity } from '../domain/model/mModel'

export class MModelRepository implements IMModelRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async findAll(tx: Prisma.TransactionClient): Promise<MModelEntity[]> {
    const models = await tx.mModel.findMany({ orderBy: { id: 'asc' } })
    return models.map(
      (m) => new MModelEntity(m.id, m.name, m.modelId, m.provider, m.color, m.isDefault)
    )
  }

  async findById(tx: Prisma.TransactionClient, id: number): Promise<MModelEntity | null> {
    const m = await tx.mModel.findUnique({ where: { id } })
    if (m === null) return null
    return new MModelEntity(m.id, m.name, m.modelId, m.provider, m.color, m.isDefault)
  }
}
