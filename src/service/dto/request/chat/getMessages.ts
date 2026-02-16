import { z } from 'zod'
import { required } from '../../../../lib/zod'
import { serviceRequestDTO } from '../abstract'

const getMessagesDTOSchema = z.object({ sessionId: required() })

export class GetMessagesRequestDTO extends serviceRequestDTO {
  readonly sessionId: string

  constructor(authId: string, sessionId: string) {
    super(authId)
    const v = getMessagesDTOSchema.parse({ sessionId })
    this.sessionId = v.sessionId
  }
}
