import { z } from 'zod'

export const streamMessageParamsSchema = z.object({
  sessionId: z.string().describe('チャットセッションID'),
})

export const streamMessageBodySchema = z.object({
  content: z.string().min(1).describe('送信するメッセージ内容'),
})
