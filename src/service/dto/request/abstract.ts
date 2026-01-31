import { z } from 'zod'
import { required } from '../../../lib/zod'

const serviceDTOSchema = z.object({
  authId: required(),
})

/**
 * @package
 */
export abstract class serviceRequestDTO {
  readonly authId: string

  constructor(authId: string) {
    const validated = serviceDTOSchema.parse({ authId })
    this.authId = validated.authId
  }
}
