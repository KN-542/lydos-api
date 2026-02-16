import type { HonoContext } from '..'
import { ChangePlanRequestDTO } from '../service/dto/request/setting/changePlan'
import { CreateCheckoutSessionRequestDTO } from '../service/dto/request/setting/createCheckoutSession'
import { DeletePaymentMethodRequestDTO } from '../service/dto/request/setting/deletePaymentMethod'
import { GetPaymentMethodsRequestDTO } from '../service/dto/request/setting/getPaymentMethods'
import { GetPlansRequestDTO } from '../service/dto/request/setting/getPlans'
import type { SettingService } from '../service/setting'
import { toRequestDTO } from './request/setting/context'
import { ChangePlanResponse } from './response/setting/changePlan'
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
      const authId = c.get('authId')
      const body = await c.req.json().catch(() => ({}))
      const requestDTO = new CreateCheckoutSessionRequestDTO(
        authId,
        body.successUrl,
        body.cancelUrl
      )
      const responseDTO = await this.settingService.createCheckoutSession(requestDTO)

      return c.json(new CreateCheckoutSessionResponse(responseDTO), 200)
    } catch (error) {
      if (
        error instanceof Error &&
        (error as Error & { code?: string }).code === 'PAYMENT_METHOD_LIMIT_EXCEEDED'
      ) {
        return c.json({ error: error.message }, 400)
      }
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

  // プラン変更
  async changePlan(c: HonoContext) {
    try {
      const authId = c.get('authId')
      const { planId, paymentMethodId } = await c.req.json()
      const requestDTO = new ChangePlanRequestDTO(authId, planId, paymentMethodId)
      await this.settingService.changePlan(requestDTO)

      return c.json(new ChangePlanResponse(), 200)
    } catch (error) {
      console.error('Error in SettingController.changePlan:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }

  // 支払い方法削除
  async deletePaymentMethod(c: HonoContext) {
    try {
      const authId = c.get('authId')
      const { paymentMethodId } = c.req.param()
      const requestDTO = new DeletePaymentMethodRequestDTO(authId, paymentMethodId)
      await this.settingService.deletePaymentMethod(requestDTO)

      return c.body(null, 204)
    } catch (error) {
      console.error('Error in SettingController.deletePaymentMethod:', error)
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }
}
