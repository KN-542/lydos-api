import type { TChatSessionEntity } from '../../../../domain/model/chat'

export class GetSessionsResponseDTO {
  readonly sessions: Array<{
    id: string
    title: string
    modelId: number
    modelName: string
    createdAt: Date
    updatedAt: Date
  }>

  constructor(entities: TChatSessionEntity[]) {
    this.sessions = entities.map(({ ...rest }) => rest)
  }
}
