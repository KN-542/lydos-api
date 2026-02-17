import type { OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppEnv } from '..'
import { changePlanBodySchema } from '../controller/request/setting/changePlan'
import { createCheckoutSessionBodySchema } from '../controller/request/setting/createCheckoutSession'
import { deletePaymentMethodParamsSchema } from '../controller/request/setting/deletePaymentMethod'
import { changePlanResponseSchema } from '../controller/response/setting/changePlan'
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
            description: '予期せぬエラーが発生しました',
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
        request: {
          body: {
            content: {
              'application/json': {
                schema: createCheckoutSessionBodySchema,
              },
            },
            required: false,
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: createCheckoutSessionResponseSchema,
              },
            },
          },
          400: {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          500: {
            description: '予期せぬエラーが発生しました',
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
          400: {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          500: {
            description: '予期せぬエラーが発生しました',
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

    app.openapi(
      {
        method: 'delete',
        path: '/setting/payment-methods/{paymentMethodId}',
        tags: ['設定'],
        summary: '支払い方法削除',
        description: '指定した支払い方法を削除します。',
        request: {
          params: deletePaymentMethodParamsSchema,
        },
        responses: {
          204: {
            description: 'No Content',
          },
          400: {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          500: {
            description: '予期せぬエラーが発生しました',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
      async (c) => {
        return await this.settingController.deletePaymentMethod(c)
      }
    )

    app.openapi(
      {
        method: 'post',
        path: '/setting/plan',
        tags: ['設定'],
        summary: 'プラン変更',
        description: '支払い方法を指定してプランを変更します。',
        request: {
          body: {
            content: {
              'application/json': {
                schema: changePlanBodySchema,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: changePlanResponseSchema,
              },
            },
          },
          400: {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          500: {
            description: '予期せぬエラーが発生しました',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
      async (c) => {
        return await this.settingController.changePlan(c)
      }
    )
  }
}
