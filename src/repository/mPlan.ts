import type { Prisma, PrismaClient } from '@prisma/client'
import type { IMPlanRepository } from '../domain/interface/mPlan'
import { MPlanEntity, type TAuthIdVO } from '../domain/model/mPlan'

export class MPlanRepository implements IMPlanRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async findAll(tx: Prisma.TransactionClient, vo: TAuthIdVO): Promise<MPlanEntity[]> {
    const plans = await tx.mPlan.findMany({
      include: {
        _count: {
          select: {
            users: { where: { authId: vo.authId } },
          },
        },
      },
    })

    return plans.map(
      (plan) =>
        new MPlanEntity(plan.id, plan.name, plan.description, plan.price, plan._count.users > 0)
    )
  }
}
