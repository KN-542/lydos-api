import { z } from 'zod'
import type { CreateSessionResponseDTO } from '../../../service/dto/response/chat/createSession'

export const createSessionResponseSchema = z.object({
  id: z.string().openapi({ example: 'clxxxxx' }),
  title: z.string().openapi({ example: '新しいチャット' }),
  modelId: z.number().openapi({ example: 1 }),
  modelName: z.string().openapi({ example: 'Gemini 2.0 Flash' }),
  createdAt: z.string().datetime().openapi({ example: '2026-01-01T00:00:00.000Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2026-01-01T00:00:00.000Z' }),
})

export class CreateSessionResponse {
  readonly id: string
  readonly title: string
  readonly modelId: number
  readonly modelName: string
  readonly createdAt: string
  readonly updatedAt: string

  constructor(dto: CreateSessionResponseDTO) {
    this.id = dto.id
    this.title = dto.title
    this.modelId = dto.modelId
    this.modelName = dto.modelName
    this.createdAt = dto.createdAt.toISOString()
    this.updatedAt = dto.updatedAt.toISOString()
  }
}
