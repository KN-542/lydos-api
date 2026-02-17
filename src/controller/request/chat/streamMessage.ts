import { z } from 'zod'
import { required } from '../../../lib/zod'

export const streamMessageParamsSchema = z.object({
  sessionId: required(
    'セッションIDを入力してください',
    'セッションIDは文字列で指定してください'
  ).describe('チャットセッションID'),
})

export const streamMessageBodySchema = z.object({
  content: required(
    'メッセージ内容を入力してください',
    'メッセージ内容は文字列で指定してください'
  ).describe('送信するメッセージ内容'),
})
