import { describe, expect, it } from 'bun:test'
import { getMessagesParamsSchema } from './getMessages'

describe('getMessagesParamsSchema', () => {
  describe('sessionId', () => {
    it('文字列は有効', () => {
      const result = getMessagesParamsSchema.safeParse({ sessionId: 'abc123' })
      expect(result.success).toBe(true)
    })

    it('必須項目のため未指定は無効', () => {
      const result = getMessagesParamsSchema.safeParse({})
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDは文字列で指定してください')
    })

    it('undefinedは無効', () => {
      const result = getMessagesParamsSchema.safeParse({ sessionId: undefined })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDは文字列で指定してください')
    })

    it('nullは無効', () => {
      const result = getMessagesParamsSchema.safeParse({ sessionId: null })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDは文字列で指定してください')
    })

    it('数値は無効', () => {
      const result = getMessagesParamsSchema.safeParse({ sessionId: 123 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDは文字列で指定してください')
    })

    it('空文字は無効 (required)', () => {
      const result = getMessagesParamsSchema.safeParse({ sessionId: '' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDを入力してください')
    })

    it('空白のみは無効 (required)', () => {
      const result = getMessagesParamsSchema.safeParse({ sessionId: '   ' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDを入力してください')
    })
  })
})
