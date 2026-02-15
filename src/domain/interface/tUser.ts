import type { Prisma } from '@prisma/client'
import type { TUserPlanAggregation, TUserPlanChangeVO, UpdateUserPlanVO } from '../model/tUser'

export interface ITUserRepository {
  findForPlanChange(
    tx: Prisma.TransactionClient,
    vo: TUserPlanChangeVO
  ): Promise<TUserPlanAggregation | null>
  updatePlan(tx: Prisma.TransactionClient, vo: UpdateUserPlanVO): Promise<void>
}
