import type { HonoContext } from '..'
import { GetPlansDTO } from '../service/dto/setting/plans'
import type { SettingService } from '../service/setting'
import type { PlansResponse } from './response/setting/plans'

export class SettingController {
  readonly settingService: SettingService

  constructor(settingService: SettingService) {
    this.settingService = settingService
  }

  // プラン一覧取得
  async getPlans(c: HonoContext): Promise<PlansResponse> {
    const authId = c.get('authId')

    const dto = new GetPlansDTO(authId)
    const plans = await this.settingService.getPlans(dto)

    return {
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        isSelected: plan.isSelected,
      })),
    }
  }
}
