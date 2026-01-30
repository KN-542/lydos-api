import type { MPlanEntity } from '../domain/model/mPlan'
import type { IMPlanRepository } from './interface/plan'

export class SettingService {
  readonly planRepository: IMPlanRepository

  constructor(planRepository: IMPlanRepository) {
    this.planRepository = planRepository
  }

  async getPlans(): Promise<MPlanEntity[]> {
    return await this.planRepository.findAll()
  }
}
