import { z } from 'zod'
import type { GetModelsResponseDTO } from '../../../service/dto/response/chat/getModels'

const modelSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'Gemini 2.0 Flash' }),
  modelId: z.string().openapi({ example: 'gemini-2.0-flash' }),
  provider: z.string().openapi({ example: 'gemini' }),
  color: z.string().openapi({ example: '#4285F4' }),
  isDefault: z.boolean().openapi({ example: true }),
})

export const getModelsResponseSchema = z.object({
  models: z.array(modelSchema),
})

export class GetModelsResponse {
  readonly models: Array<{
    id: number
    name: string
    modelId: string
    provider: string
    color: string
    isDefault: boolean
  }>

  constructor(dto: GetModelsResponseDTO) {
    this.models = dto.models
  }
}
