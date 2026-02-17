import type { TChatSessionCreateEntity } from '../../../../domain/model/chat'

export class CreateSessionResponseDTO {
  readonly id: string

  constructor(entity: TChatSessionCreateEntity) {
    this.id = entity.id
  }
}
