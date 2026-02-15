import { z } from 'zod'

export const changePlanBodySchema = z.object({
  planId: z.number().int().positive().describe('変更先プラン ID'),
  paymentMethodId: z.string().describe('Stripe Payment Method ID (pm_xxx)'),
})
