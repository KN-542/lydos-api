import { z } from 'zod'
import { required } from '../../../../lib/zod'
import { serviceRequestDTO } from '../abstract'

const changePlanDTOSchema = z.object({
  planId: z.number().int().positive(),
  paymentMethodId: required(),
})

export class ChangePlanRequestDTO extends serviceRequestDTO {
  readonly planId: number
  readonly paymentMethodId: string

  constructor(authId: string, planId: number, paymentMethodId: string) {
    super(authId)
    const validated = changePlanDTOSchema.parse({ planId, paymentMethodId })
    this.planId = validated.planId
    this.paymentMethodId = validated.paymentMethodId
  }
}
