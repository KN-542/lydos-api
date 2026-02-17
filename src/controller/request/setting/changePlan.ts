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

export const changePlanBodySchema = z.object({
  planId: z
    .number({ error: 'プランIDは数値で指定してください' })
    .int('プランIDは整数で指定してください')
    .positive('プランIDは1以上の値を指定してください')
    .describe('変更先プラン ID'),
  paymentMethodId: paymentMethodIdSchema.describe('Stripe Payment Method ID (pm_xxx)'),
})
