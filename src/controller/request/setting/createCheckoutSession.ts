import { z } from 'zod'

export const createCheckoutSessionBodySchema = z.object({
  successUrl: z.string().url().optional().describe('決済完了後のリダイレクト先 URL'),
  cancelUrl: z.string().url().optional().describe('決済キャンセル時のリダイレクト先 URL'),
})
