import { z } from 'zod'

const paymentMethodIdSchema = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return v
    return v.trim()
  },
  z
    .string({ error: 'Stripe決済IDは文字列で指定してください' })
    .min(1, 'Stripe決済IDを入力してください')
    .startsWith('pm_', 'Stripe決済IDは pm_ で始まる必要があります')
)

export const deletePaymentMethodParamsSchema = z.object({
  paymentMethodId: paymentMethodIdSchema.describe('Stripe Payment Method ID (pm_xxx)'),
})
