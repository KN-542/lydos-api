import { z } from 'zod'

// Entity: AIモデルマスタ（name, modelId, provider, color, isDefault）
const mModelEntitySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  modelId: z.string().min(1),
  provider: z.string().min(1),
  color: z.string().length(7),
  isDefault: z.boolean(),
})
export class MModelEntity {
  readonly id: number
  readonly name: string
  readonly modelId: string
  readonly provider: string
  readonly color: string
  readonly isDefault: boolean

  constructor(
    id: number,
    name: string,
    modelId: string,
    provider: string,
    color: string,
    isDefault: boolean
  ) {
    const v = mModelEntitySchema.parse({ id, name, modelId, provider, color, isDefault })
    this.id = v.id
    this.name = v.name
    this.modelId = v.modelId
    this.provider = v.provider
    this.color = v.color
    this.isDefault = v.isDefault
  }
}
