import { z } from 'zod'
import { required } from '../../lib/zod'
import type { MModelEntity } from './mModel'

// VO: セッション作成用（userId, modelId, title）
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

// VO: セッション更新用（title は任意、updatedAt は常に更新）
const updateSessionVOSchema = z.object({
  sessionId: required(),
  title: z.string().min(1).max(255).optional(),
})
export class UpdateSessionVO {
  readonly sessionId: string
  readonly title?: string
  constructor(sessionId: string, fields: { title?: string } = {}) {
    const v = updateSessionVOSchema.parse({ sessionId, ...fields })
    this.sessionId = v.sessionId
    this.title = v.title
  }
}

// VO: セッション操作共通（authId + sessionId でユーザー所有を確認）
const sessionVOSchema = z.object({ authId: required(), sessionId: required() })
export class SessionVO {
  readonly authId: string
  readonly sessionId: string
  constructor(authId: string, sessionId: string) {
    const v = sessionVOSchema.parse({ authId, sessionId })
    this.authId = v.authId
    this.sessionId = v.sessionId
  }
}

// Entity: セッション作成結果（id のみ）
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

// Entity: チャットセッション（title, modelId, modelName）
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

// Aggregation: チャットセッション + 使用モデル情報
export type TChatSessionAggregation = {
  session: TChatSessionEntity
  model: MModelEntity
}
