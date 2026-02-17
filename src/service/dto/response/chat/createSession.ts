import type { CreateTChatSessionEntity } from '../../../../domain/model/tChatSession'

export class CreateSessionResponseDTO {
  readonly id: string

  constructor(entity: CreateTChatSessionEntity) {
    this.id = entity.id
  }
}
