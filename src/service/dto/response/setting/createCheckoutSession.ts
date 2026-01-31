export class CreateCheckoutSessionResponseDTO {
  readonly checkoutUrl: string

  constructor(checkoutUrl: string) {
    this.checkoutUrl = checkoutUrl
  }
}
