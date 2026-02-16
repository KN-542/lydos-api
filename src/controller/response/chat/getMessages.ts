import { z } from 'zod'
import type { GetMessagesResponseDTO } from '../../../service/dto/response/chat/getMessages'

const messageSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  role: z.enum(['user', 'assistant']).openapi({ example: 'user' }),
  content: z.string().openapi({ example: 'こんにちは' }),
  inputTokens: z.number().nullable().openapi({ example: 10 }),
  outputTokens: z.number().nullable().openapi({ example: 50 }),
  createdAt: z.string().datetime().openapi({ example: '2026-01-01T00:00:00.000Z' }),
})

export const getMessagesResponseSchema = z.object({
  messages: z.array(messageSchema),
})

export class GetMessagesResponse {
  readonly messages: Array<{
    id: number
    role: 'user' | 'assistant'
    content: string
    inputTokens: number | null
    outputTokens: number | null
    createdAt: string
  }>

  constructor(dto: GetMessagesResponseDTO) {
    this.messages = dto.messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    }))
  }
}
