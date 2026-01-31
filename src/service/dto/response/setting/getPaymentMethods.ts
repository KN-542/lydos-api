export class GetPaymentMethodsResponseDTO {
  readonly paymentMethods: Array<{
    id: string
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }>

  constructor(
    paymentMethods: Array<{
      id: string
      brand: string
      last4: string
      expMonth: number
      expYear: number
    }>
  ) {
    this.paymentMethods = paymentMethods
  }
}
