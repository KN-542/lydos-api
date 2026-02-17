import { z } from 'zod'

/**
 * 必須文字列バリデータ
 * - typeMessage: 文字列以外の型が渡された場合のエラーメッセージ
 * - message: 空文字・空白のみの場合のエラーメッセージ
 */
export const required = (message?: string, typeMessage?: string) =>
  z.preprocess(
    (v) => {
      if (typeof v !== 'string') {
        return v
      }
      return v.trim()
    },
    z.string({ error: typeMessage ?? message }).min(1, message)
  )
