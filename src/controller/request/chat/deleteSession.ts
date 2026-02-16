import { z } from 'zod'

export const deleteSessionParamsSchema = z.object({
  sessionId: z.string().describe('チャットセッションID'),
})
