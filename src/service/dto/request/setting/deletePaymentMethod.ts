import { z } from 'zod'
import { required } from '../../../../lib/zod'
import { serviceRequestDTO } from '../abstract'

const deletePaymentMethodDTOSchema = z.object({
  paymentMethodId: required(),
})

export class DeletePaymentMethodRequestDTO extends serviceRequestDTO {
  readonly paymentMethodId: string

  constructor(authId: string, paymentMethodId: string) {
    super(authId)
    const validated = deletePaymentMethodDTOSchema.parse({ paymentMethodId })
    this.paymentMethodId = validated.paymentMethodId
  }
}
