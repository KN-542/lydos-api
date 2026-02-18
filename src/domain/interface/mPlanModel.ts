import type { Prisma } from '@prisma/client'
import type { MPlanModelEntity, PlanModelVO } from '../model/mPlanModel'

export interface IMPlanModelRepository {
  find(tx: Prisma.TransactionClient, vo: PlanModelVO): Promise<MPlanModelEntity | null>
}
