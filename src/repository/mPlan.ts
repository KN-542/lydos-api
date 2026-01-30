import type { PrismaClient } from '@prisma/client'
import { MPlanEntity } from '../domain/model/mPlan'
import type { IMPlanRepository } from '../service/interface/plan'

export class MPlanRepository implements IMPlanRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async findAll(): Promise<MPlanEntity[]> {
    const plans = await this.prisma.mPlan.findMany({
      orderBy: { id: 'asc' },
    })

    return plans.map(
      (plan) => new MPlanEntity(plan.id, plan.name, plan.description, plan.price, plan.createdAt)
    )
  }
}
