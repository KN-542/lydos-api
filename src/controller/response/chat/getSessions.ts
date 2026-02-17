import { z } from 'zod'
import type { GetSessionsResponseDTO } from '../../../service/dto/response/chat/getSessions'

const sessionSchema = z.object({
  id: z.string().openapi({ example: 'clxxxxx' }),
  title: z.string().openapi({ example: '新しいチャット' }),
  modelId: z.number().openapi({ example: 1 }),
  modelName: z.string().openapi({ example: 'Gemini 2.0 Flash' }),
})

export const getSessionsResponseSchema = z.object({
  sessions: z.array(sessionSchema),
})

export class GetSessionsResponse {
  readonly sessions: Array<{
    id: string
    title: string
    modelId: number
    modelName: string
  }>

  constructor(dto: GetSessionsResponseDTO) {
    this.sessions = dto.sessions.map((s) => ({ ...s }))
  }
}
