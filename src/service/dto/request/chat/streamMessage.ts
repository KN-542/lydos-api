import { z } from 'zod'
import { required } from '../../../../lib/zod'
import { serviceRequestDTO } from '../abstract'

const streamMessageDTOSchema = z.object({
  sessionId: required(),
  content: z.string().min(1),
})

export class StreamMessageRequestDTO extends serviceRequestDTO {
  readonly sessionId: string
  readonly content: string

  constructor(authId: string, sessionId: string, content: string) {
    super(authId)
    const v = streamMessageDTOSchema.parse({ sessionId, content })
    this.sessionId = v.sessionId
    this.content = v.content
  }
}
