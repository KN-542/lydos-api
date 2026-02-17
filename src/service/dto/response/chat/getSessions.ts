import type { TChatSessionEntity } from '../../../../domain/model/tChatSession'

export class GetSessionsResponseDTO {
  readonly sessions: Array<{
    id: string
    title: string
    modelId: number
    modelName: string
  }>

  constructor(entities: TChatSessionEntity[]) {
    this.sessions = entities.map(({ ...rest }) => rest)
  }
}
