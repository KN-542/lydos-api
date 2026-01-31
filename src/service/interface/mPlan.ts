import type { Prisma } from '@prisma/client'
import type { MPlanEntity, TAuthIdVO } from '../../domain/model/mPlan'

export interface IMPlanRepository {
  findAll(tx: Prisma.TransactionClient, vo: TAuthIdVO): Promise<MPlanEntity[]>
}
