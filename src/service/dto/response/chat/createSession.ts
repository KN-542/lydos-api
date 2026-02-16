import type { TChatSessionEntity } from '../../../../domain/model/chat'

export class CreateSessionResponseDTO {
  readonly id: string
  readonly title: string
  readonly modelId: number
  readonly modelName: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(entity: TChatSessionEntity) {
    this.id = entity.id
    this.title = entity.title
    this.modelId = entity.modelId
    this.modelName = entity.modelName
    this.createdAt = entity.createdAt
    this.updatedAt = entity.updatedAt
  }
}
