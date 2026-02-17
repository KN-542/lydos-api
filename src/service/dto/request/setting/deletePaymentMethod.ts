import { serviceRequestDTO } from '../abstract'

export class DeletePaymentMethodRequestDTO extends serviceRequestDTO {
  readonly paymentMethodId: string

  constructor(authId: string, paymentMethodId: string) {
    super(authId)
    this.paymentMethodId = paymentMethodId
  }
}
