import type { HonoContext } from '..'
import { CreateCheckoutSessionRequestDTO } from '../service/dto/request/setting/createCheckoutSession'
import { GetPaymentMethodsRequestDTO } from '../service/dto/request/setting/getPaymentMethods'
import { GetPlansRequestDTO } from '../service/dto/request/setting/getPlans'
import type { SettingService } from '../service/setting'
import { toRequestDTO } from './request/setting/context'
import { CreateCheckoutSessionResponse } from './response/setting/createCheckoutSession'
import { GetPaymentMethodsResponse } from './response/setting/getPaymentMethods'
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

  // Checkout Session作成
  async createCheckoutSession(c: HonoContext) {
    try {
      const requestDTO = toRequestDTO(c, CreateCheckoutSessionRequestDTO)
      const responseDTO = await this.settingService.createCheckoutSession(requestDTO)
      const response = new CreateCheckoutSessionResponse(responseDTO)

      return c.json(response, 200)
    } catch (error) {
      console.error('Error in SettingController.createCheckoutSession:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }

  // 支払い方法一覧取得
  async getPaymentMethods(c: HonoContext) {
    try {
      const requestDTO = toRequestDTO(c, GetPaymentMethodsRequestDTO)
      const responseDTO = await this.settingService.getPaymentMethods(requestDTO)
      const response = new GetPaymentMethodsResponse(responseDTO)

      return c.json(response, 200)
    } catch (error) {
      console.error('Error in SettingController.getPaymentMethods:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }
}
