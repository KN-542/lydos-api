export class GetPaymentMethodsResponseDTO {
  readonly paymentMethods: Array<{
    id: string
    brand: string
    last4: string
    expMonth: number
    expYear: number
    isDefault: boolean
  }>

  constructor(
    paymentMethods: Array<{
      id: string
      brand: string
      last4: string
      expMonth: number
      expYear: number
      isDefault: boolean
    }>
  ) {
    this.paymentMethods = paymentMethods
  }
}
