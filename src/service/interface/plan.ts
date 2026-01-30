import type { MPlanEntity } from '../../domain/model/mPlan'

export interface IMPlanRepository {
  findAll(): Promise<MPlanEntity[]>
}
