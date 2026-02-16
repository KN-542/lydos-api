import { z } from 'zod'

export const createSessionBodySchema = z.object({
  modelId: z.number().int().positive().describe('使用するAIモデルID'),
  title: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe('セッションタイトル（省略時: "新しいチャット"）'),
})
