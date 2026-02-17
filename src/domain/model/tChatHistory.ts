import { z } from 'zod'
import { required } from '../../lib/zod'

const tChatHistoryEntitySchema = z.object({
  id: z.number().int().positive(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  inputTokens: z.number().int().nonnegative().nullable(),
  outputTokens: z.number().int().nonnegative().nullable(),
  createdAt: z.date(),
})

export class TChatHistoryEntity {
  readonly id: number
  readonly role: 'user' | 'assistant'
  readonly content: string
  readonly inputTokens: number | null
  readonly outputTokens: number | null
  readonly createdAt: Date

  constructor(
    id: number,
    role: 'user' | 'assistant',
    content: string,
    inputTokens: number | null,
    outputTokens: number | null,
    createdAt: Date
  ) {
    const v = tChatHistoryEntitySchema.parse({
      id,
      role,
      content,
      inputTokens,
      outputTokens,
      createdAt,
    })
    this.id = v.id
    this.role = v.role
    this.content = v.content
    this.inputTokens = v.inputTokens
    this.outputTokens = v.outputTokens
    this.createdAt = v.createdAt
  }
}

const findBySessionVOSchema = z.object({ authId: required(), sessionId: required() })
export class FindBySessionVO {
  readonly authId: string
  readonly sessionId: string
  constructor(authId: string, sessionId: string) {
    const v = findBySessionVOSchema.parse({ authId, sessionId })
    this.authId = v.authId
    this.sessionId = v.sessionId
  }
}

const createMessageVOSchema = z.object({
  sessionId: required(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
  inputTokens: z.number().int().nonnegative().nullable(),
  outputTokens: z.number().int().nonnegative().nullable(),
})
export class CreateMessageVO {
  readonly sessionId: string
  readonly role: 'user' | 'assistant'
  readonly content: string
  readonly inputTokens: number | null
  readonly outputTokens: number | null
  constructor(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    inputTokens: number | null = null,
    outputTokens: number | null = null
  ) {
    const v = createMessageVOSchema.parse({ sessionId, role, content, inputTokens, outputTokens })
    this.sessionId = v.sessionId
    this.role = v.role
    this.content = v.content
    this.inputTokens = v.inputTokens
    this.outputTokens = v.outputTokens
  }
}
