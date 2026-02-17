import type { Prisma } from '@prisma/client'
import type {
  TUserEntity,
  TUserPlanAggregation,
  TUserPlanChangeVO,
  UpdateUserPlanVO,
} from '../model/tUser'

export interface ITUserRepository {
  findByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<TUserEntity | null>
  findForPlanChange(
    tx: Prisma.TransactionClient,
    vo: TUserPlanChangeVO
  ): Promise<TUserPlanAggregation | null>
  updatePlan(tx: Prisma.TransactionClient, vo: UpdateUserPlanVO): Promise<void>
}
