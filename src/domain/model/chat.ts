import { z } from 'zod'
import { required } from '../../lib/zod'

// ---------------------------------------------------------------------------
// MModel Entity
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// TChatSessionCreate Entity
// ---------------------------------------------------------------------------
const tChatSessionCreateEntitySchema = z.object({
  id: z.string().min(1),
})

export class TChatSessionCreateEntity {
  readonly id: string

  constructor(id: string) {
    const v = tChatSessionCreateEntitySchema.parse({ id })
    this.id = v.id
  }
}

// ---------------------------------------------------------------------------
// TChatSession Entity
// ---------------------------------------------------------------------------
const tChatSessionEntitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  modelId: z.number().int().positive(),
  modelName: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export class TChatSessionEntity {
  readonly id: string
  readonly title: string
  readonly modelId: number
  readonly modelName: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(
    id: string,
    title: string,
    modelId: number,
    modelName: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    const v = tChatSessionEntitySchema.parse({
      id,
      title,
      modelId,
      modelName,
      createdAt,
      updatedAt,
    })
    this.id = v.id
    this.title = v.title
    this.modelId = v.modelId
    this.modelName = v.modelName
    this.createdAt = v.createdAt
    this.updatedAt = v.updatedAt
  }
}

// ---------------------------------------------------------------------------
// TChatHistory Entity
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Value Objects
// ---------------------------------------------------------------------------

const chatAuthVOSchema = z.object({ authId: required() })
export class ChatAuthVO {
  readonly authId: string
  constructor(authId: string) {
    const v = chatAuthVOSchema.parse({ authId })
    this.authId = v.authId
  }
}

const createSessionVOSchema = z.object({
  userId: z.number().int().positive(),
  modelId: z.number().int().positive(),
  title: z.string().min(1).max(255),
})
export class CreateSessionVO {
  readonly userId: number
  readonly modelId: number
  readonly title: string
  constructor(userId: number, modelId: number, title: string) {
    const v = createSessionVOSchema.parse({ userId, modelId, title })
    this.userId = v.userId
    this.modelId = v.modelId
    this.title = v.title
  }
}

const sessionOwnerVOSchema = z.object({ authId: required(), sessionId: required() })
export class SessionOwnerVO {
  readonly authId: string
  readonly sessionId: string
  constructor(authId: string, sessionId: string) {
    const v = sessionOwnerVOSchema.parse({ authId, sessionId })
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
