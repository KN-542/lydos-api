import { z } from 'zod'
import { required } from '../../lib/zod'

const createTChatSessionEntitySchema = z.object({
  id: z.string().min(1),
})

export class CreateTChatSessionEntity {
  readonly id: string

  constructor(id: string) {
    const v = createTChatSessionEntitySchema.parse({ id })
    this.id = v.id
  }
}

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

const chatAuthVOSchema = z.object({ authId: required() })
export class ChatAuthVO {
  readonly authId: string
  constructor(authId: string) {
    const v = chatAuthVOSchema.parse({ authId })
    this.authId = v.authId
  }
}

// チャットセッション作成VO
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

const deleteSessionVOSchema = z.object({ authId: required(), sessionId: required() })
export class DeleteSessionVO {
  readonly authId: string
  readonly sessionId: string
  constructor(authId: string, sessionId: string) {
    const v = deleteSessionVOSchema.parse({ authId, sessionId })
    this.authId = v.authId
    this.sessionId = v.sessionId
  }
}
