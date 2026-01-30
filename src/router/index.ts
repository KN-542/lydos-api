import type { OpenAPIHono } from '@hono/zod-openapi'
import type { AppEnv } from '..'
import { plansResponseSchema } from '../controller/response/setting/plans'
import type { SettingController } from '../controller/setting'

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
        },
      },
      async (c) => {
        const response = await this.settingController.getPlans(c)
        return c.json(response)
      }
    )
  }
}
