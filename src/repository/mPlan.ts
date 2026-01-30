import type { PrismaClient } from '@prisma/client'
import { MPlanEntity, type TAuthIdVO } from '../domain/model/mPlan'
import type { IMPlanRepository } from '../service/interface/plan'

export class MPlanRepository implements IMPlanRepository {
  readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async findAll(vo: TAuthIdVO): Promise<MPlanEntity[]> {
    const plans = await this.prisma.mPlan.findMany({
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
        new MPlanEntity(
          plan.id,
          plan.name,
          plan.description,
          plan.price,
          plan.createdAt,
          plan._count.users > 0
        )
    )
  }
}
