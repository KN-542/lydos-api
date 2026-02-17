import { z } from 'zod'
import { required } from '../../../lib/zod'

export const deleteSessionParamsSchema = z.object({
  sessionId: required(
    'セッションIDを入力してください',
    'セッションIDは文字列で指定してください'
  ).describe('チャットセッションID'),
})
