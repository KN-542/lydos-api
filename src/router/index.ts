import type { OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppEnv } from '..'
import { createCheckoutSessionResponseSchema } from '../controller/response/setting/createCheckoutSession'
import { getPaymentMethodsResponseSchema } from '../controller/response/setting/getPaymentMethods'
import { plansResponseSchema } from '../controller/response/setting/getPlans'
import type { SettingController } from '../controller/setting'

const errorResponseSchema = z.object({
  error: z.string(),
})

export class SettingRouter {
  readonly settingController: SettingController

  constructor(settingController: SettingController) {
    this.settingController = settingController
  }

  registerRoutes(app: OpenAPIHono<AppEnv>) {
    app.openapi(
      {
        method: 'get',
        path: '/setting/plans',
        tags: ['設定'],
        summary: 'プラン一覧取得',
        description: '利用可能なプラン一覧を取得します',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: plansResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
      async (c) => {
        return await this.settingController.getPlans(c)
      }
    )

    app.openapi(
      {
        method: 'post',
        path: '/setting/checkout-session',
        tags: ['設定'],
        summary: 'Checkout Session作成',
        description: 'カード登録用のCheckout Sessionを作成します。',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: createCheckoutSessionResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
      async (c) => {
        return await this.settingController.createCheckoutSession(c)
      }
    )

    app.openapi(
      {
        method: 'get',
        path: '/setting/payment-methods',
        tags: ['設定'],
        summary: '支払い方法一覧取得',
        description: '登録済みの支払い方法一覧を取得します。',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: getPaymentMethodsResponseSchema,
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
      async (c) => {
        return await this.settingController.getPaymentMethods(c)
      }
    )
  }
}
