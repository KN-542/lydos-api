import { serviceRequestDTO } from '../abstract'

export class CreateCheckoutSessionRequestDTO extends serviceRequestDTO {
  readonly successUrl?: string
  readonly cancelUrl?: string

  constructor(authId: string, successUrl?: string, cancelUrl?: string) {
    super(authId)
    this.successUrl = successUrl
    this.cancelUrl = cancelUrl
  }
}
