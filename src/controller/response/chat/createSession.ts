import { z } from 'zod'
import type { CreateSessionResponseDTO } from '../../../service/dto/response/chat/createSession'

export const createSessionResponseSchema = z.object({
  id: z.string().openapi({ example: 'clxxxxx' }),
})

export class CreateSessionResponse {
  readonly id: string

  constructor(dto: CreateSessionResponseDTO) {
    this.id = dto.id
  }
}
