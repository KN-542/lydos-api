import { serviceRequestDTO } from '../abstract'

export class GetMessagesRequestDTO extends serviceRequestDTO {
  readonly sessionId: string

  constructor(authId: string, sessionId: string) {
    super(authId)
    this.sessionId = sessionId
  }
}
