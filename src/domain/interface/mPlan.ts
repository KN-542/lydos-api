import type { Prisma } from '@prisma/client'
import type { MPlanEntity } from '../../domain/model/mPlan'

export interface IMPlanRepository {
  findAllByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<MPlanEntity[]>
}
