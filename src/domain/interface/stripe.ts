export interface IStripeRepository {
  createCustomer(email: string, name: string): Promise<string>
  createCheckoutSession(customerId: string, successUrl: string, cancelUrl: string): Promise<string>
  getPaymentMethods(customerId: string): Promise<
    Array<{
      id: string
      brand: string
      last4: string
      expMonth: number
      expYear: number
    }>
  >
  detachPaymentMethod(paymentMethodId: string): Promise<void>
}
