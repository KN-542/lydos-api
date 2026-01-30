import type { MPlanEntity, TAuthIdVO } from '../../domain/model/mPlan'

export interface IMPlanRepository {
  findAll(vo: TAuthIdVO): Promise<MPlanEntity[]>
}
