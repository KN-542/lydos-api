import { z } from 'zod'

export const createCheckoutSessionBodySchema = z.object({
  successUrl: z
    .url('有効なURLを入力してください')
    .optional()
    .describe('決済完了後のリダイレクト先 URL'),
  cancelUrl: z
    .url('有効なURLを入力してください')
    .optional()
    .describe('決済キャンセル時のリダイレクト先 URL'),
})
