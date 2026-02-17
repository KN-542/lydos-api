import { serviceRequestDTO } from '../abstract'

export class StreamMessageRequestDTO extends serviceRequestDTO {
  readonly sessionId: string
  readonly content: string

  constructor(authId: string, sessionId: string, content: string) {
    super(authId)
    this.sessionId = sessionId
    this.content = content
  }
}
