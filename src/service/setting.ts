import { type MPlanEntity, TAuthIdVO } from '../domain/model/mPlan'
import type { GetPlansDTO } from './dto/setting/plans'
import type { IMPlanRepository } from './interface/plan'

export class SettingService {
  readonly planRepository: IMPlanRepository

  constructor(planRepository: IMPlanRepository) {
    this.planRepository = planRepository
  }

  async getPlans(dto: GetPlansDTO): Promise<MPlanEntity[]> {
    const { authId } = dto
    const vo = new TAuthIdVO(authId)

    return await this.planRepository.findAll(vo)
  }
}
