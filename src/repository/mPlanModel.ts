import type { Prisma, PrismaClient } from '@prisma/client'
import type { IMPlanModelRepository } from '../domain/interface/mPlanModel'
import { MPlanModelEntity, type PlanModelVO } from '../domain/model/mPlanModel'

export class MPlanModelRepository implements IMPlanModelRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async find(tx: Prisma.TransactionClient, vo: PlanModelVO): Promise<MPlanModelEntity | null> {
    const record = await tx.mPlanModel.findUnique({
      where: { planId_modelId: { planId: vo.planId, modelId: vo.modelId } },
    })
    if (record === null) return null
    return new MPlanModelEntity(record.planId, record.modelId)
  }
}
