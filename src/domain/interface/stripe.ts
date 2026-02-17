export interface IStripe {
  createCustomer(email: string, name: string): Promise<string>
  createCheckoutSession(customerId: string, successUrl: string, cancelUrl: string): Promise<string>
  getPaymentMethods(customerId: string): Promise<
    Array<{
      id: string
      brand: string
      last4: string
      expMonth: number
      expYear: number
      isDefault: boolean
    }>
  >
  detachPaymentMethod(paymentMethodId: string): Promise<void>
  setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void>
  createSubscription(customerId: string, priceId: string, paymentMethodId: string): Promise<string>
  updateSubscription(subscriptionId: string, priceId: string): Promise<void>
  cancelSubscription(subscriptionId: string): Promise<void>
}
