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
})

export class TChatSessionEntity {
  readonly id: string
  readonly title: string
  readonly modelId: number
  readonly modelName: string

  constructor(id: string, title: string, modelId: number, modelName: string) {
    const v = tChatSessionEntitySchema.parse({ id, title, modelId, modelName })
    this.id = v.id
    this.title = v.title
    this.modelId = v.modelId
    this.modelName = v.modelName
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
