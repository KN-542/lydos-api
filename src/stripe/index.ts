import type StripeSDK from 'stripe'
import type { IStripe } from '../domain/interface/stripe'
import { stripe } from './client'

export class Stripe implements IStripe {
  /**
   * Stripe Customerを作成
   * @param email ユーザーのメールアドレス
   * @param name ユーザー名
   * @returns Stripe Customer ID (cus_xxx)
   */
  async createCustomer(email: string, name: string): Promise<string> {
    const customer: StripeSDK.Customer = await stripe.customers.create({
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
    const session: StripeSDK.Checkout.Session = await stripe.checkout.sessions.create({
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
      isDefault: boolean
    }>
  > {
    const [customer, paymentMethods] = await Promise.all([
      stripe.customers.retrieve(customerId),
      stripe.paymentMethods.list({ customer: customerId, type: 'card' }),
    ])

    const defaultPmId =
      customer.deleted !== true &&
      typeof (customer as StripeSDK.Customer).invoice_settings?.default_payment_method === 'string'
        ? ((customer as StripeSDK.Customer).invoice_settings?.default_payment_method as string)
        : null

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? '',
      last4: pm.card?.last4 ?? '',
      expMonth: pm.card?.exp_month ?? 0,
      expYear: pm.card?.exp_year ?? 0,
      isDefault: pm.id === defaultPmId,
    }))
  }

  /**
   * 支払い方法をCustomerから切り離す
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    await stripe.paymentMethods.detach(paymentMethodId)
  }

  /**
   * CustomerのデフォルトPayment Methodを設定する
   */
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })
  }

  /**
   * サブスクリプションを新規作成する
   * @returns Stripe Subscription ID (sub_xxx)
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string
  ): Promise<string> {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
    })
    return subscription.id
  }

  /**
   * 既存サブスクリプションのプランを変更する
   */
  async updateSubscription(subscriptionId: string, priceId: string): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const itemId = subscription.items.data[0]?.id
    if (!itemId) {
      throw new Error('Subscription item not found')
    }
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: priceId }],
    })
  }

  /**
   * サブスクリプションをキャンセルする
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await stripe.subscriptions.cancel(subscriptionId)
  }
}
