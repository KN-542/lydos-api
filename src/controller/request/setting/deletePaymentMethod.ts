import { z } from 'zod'

export const deletePaymentMethodParamsSchema = z.object({
  paymentMethodId: z.string().describe('Stripe Payment Method ID (pm_xxx)'),
})
