import { z } from 'zod'
import { serviceRequestDTO } from '../abstract'

const createSessionDTOSchema = z.object({
  modelId: z.number().int().positive(),
  title: z.string().min(1).max(255).optional(),
})

export class CreateSessionRequestDTO extends serviceRequestDTO {
  readonly modelId: number
  readonly title: string

  constructor(authId: string, modelId: number, title?: string) {
    super(authId)
    const v = createSessionDTOSchema.parse({ modelId, title })
    this.modelId = v.modelId
    this.title = v.title ?? '新しいチャット'
  }
}
