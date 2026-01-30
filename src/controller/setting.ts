import type { SettingService } from '../service/setting'
import type { PlansResponse } from './response/setting/plans'

export class SettingController {
  readonly settingService: SettingService

  constructor(settingService: SettingService) {
    this.settingService = settingService
  }

  // プラン一覧取得
  async getPlans(): Promise<PlansResponse> {
    const plans = await this.settingService.getPlans()

    return {
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
      })),
    }
  }
}
