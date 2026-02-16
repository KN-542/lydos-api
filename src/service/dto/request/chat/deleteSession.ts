import { z } from 'zod'
import { required } from '../../../../lib/zod'
import { serviceRequestDTO } from '../abstract'

const deleteSessionDTOSchema = z.object({ sessionId: required() })

export class DeleteSessionRequestDTO extends serviceRequestDTO {
  readonly sessionId: string

  constructor(authId: string, sessionId: string) {
    super(authId)
    const v = deleteSessionDTOSchema.parse({ sessionId })
    this.sessionId = v.sessionId
  }
}
