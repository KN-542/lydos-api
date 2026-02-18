import { z } from 'zod'

// VO: プラン利用可能モデル検索用（planId + modelId）
const planModelVOSchema = z.object({
  planId: z.number().int().positive(),
  modelId: z.number().int().positive(),
})
export class PlanModelVO {
  readonly planId: number
  readonly modelId: number

  constructor(planId: number, modelId: number) {
    const v = planModelVOSchema.parse({ planId, modelId })
    this.planId = v.planId
    this.modelId = v.modelId
  }
}

// Entity: プラン利用可能モデル
const mPlanModelEntitySchema = z.object({
  planId: z.number().int().positive(),
  modelId: z.number().int().positive(),
})
export class MPlanModelEntity {
  readonly planId: number
  readonly modelId: number

  constructor(planId: number, modelId: number) {
    const v = mPlanModelEntitySchema.parse({ planId, modelId })
    this.planId = v.planId
    this.modelId = v.modelId
  }
}
