import type Stripe from 'stripe'
import type { IStripeRepository } from '../domain/interface/stripe'
import { stripe } from './client'

export class StripeRepository implements IStripeRepository {
  /**
   * Stripe Customerを作成
   * @param email ユーザーのメールアドレス
   * @param name ユーザー名
   * @returns Stripe Customer ID (cus_xxx)
   */
  async createCustomer(email: string, name: string): Promise<string> {
    const customer: Stripe.Customer = await stripe.customers.create({
      email,
      name,
    })
    return customer.id
  }

  /**
   * Checkout Sessionを作成（支払い方法登録用）
   * @param customerId Stripe Customer ID
   * @param successUrl 成功時のリダイレクトURL
   * @param cancelUrl キャンセル時のリダイレクトURL
   * @returns Checkout Session URL
   */
  async createCheckoutSession(
    customerId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    if (session.url === null) {
      throw new Error('Checkout Session URL is null')
    }

    return session.url
  }

  /**
   * Customerの支払い方法一覧を取得
   * @param customerId Stripe Customer ID
   * @returns Payment Methods
   */
  async getPaymentMethods(customerId: string): Promise<
    Array<{
      id: string
      brand: string
      last4: string
      expMonth: number
      expYear: number
    }>
  > {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? '',
      last4: pm.card?.last4 ?? '',
      expMonth: pm.card?.exp_month ?? 0,
      expYear: pm.card?.exp_year ?? 0,
    }))
  }
}
