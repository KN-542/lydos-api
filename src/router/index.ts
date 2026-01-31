import type { OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import type { AppEnv } from '..'
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
  }
}
