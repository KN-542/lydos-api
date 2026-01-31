import type { HonoContext } from '..'
import { GetPlansRequestDTO } from '../service/dto/request/setting/getPlans'
import type { SettingService } from '../service/setting'
import { toRequestDTO } from './request/setting/context'
import { GetPlansResponse } from './response/setting/getPlans'

export class SettingController {
  readonly settingService: SettingService

  constructor(settingService: SettingService) {
    this.settingService = settingService
  }

  // プラン一覧取得
  async getPlans(c: HonoContext) {
    try {
      const requestDTO = toRequestDTO(c, GetPlansRequestDTO)
      const responseDTO = await this.settingService.getPlans(requestDTO)
      const response = new GetPlansResponse(responseDTO)

      return c.json(response, 200)
    } catch (error) {
      console.error('Error in SettingController.getPlans:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }
}
