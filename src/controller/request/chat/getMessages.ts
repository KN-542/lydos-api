import { z } from 'zod'

export const getMessagesParamsSchema = z.object({
  sessionId: z.string().describe('チャットセッションID'),
})
