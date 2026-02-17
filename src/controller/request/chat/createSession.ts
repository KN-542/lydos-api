import { z } from 'zod'

export const createSessionBodySchema = z.object({
  modelId: z
    .number({ error: 'AIモデルIDは数値で指定してください' })
    .int('AIモデルIDは整数で指定してください')
    .positive('AIモデルIDは1以上の値を指定してください')
    .describe('使用するAIモデルID'),
  title: z
    .string({ error: 'セッションタイトルは文字列で指定してください' })
    .min(1, 'セッションタイトルは1文字以上で入力してください')
    .max(255, 'セッションタイトルは255文字以内で入力してください')
    .optional()
    .describe('セッションタイトル（省略時: "新しいチャット"）'),
})
