import { describe, expect, it } from 'bun:test'
import { streamMessageBodySchema, streamMessageParamsSchema } from './streamMessage'

describe('streamMessageParamsSchema', () => {
  describe('sessionId', () => {
    it('文字列は有効', () => {
      const result = streamMessageParamsSchema.safeParse({ sessionId: 'abc123' })
      expect(result.success).toBe(true)
    })

    it('必須項目のため未指定は無効', () => {
      const result = streamMessageParamsSchema.safeParse({})
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDは文字列で指定してください')
    })

    it('undefinedは無効', () => {
      const result = streamMessageParamsSchema.safeParse({ sessionId: undefined })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDは文字列で指定してください')
    })

    it('nullは無効', () => {
      const result = streamMessageParamsSchema.safeParse({ sessionId: null })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDは文字列で指定してください')
    })

    it('数値は無効', () => {
      const result = streamMessageParamsSchema.safeParse({ sessionId: 123 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDは文字列で指定してください')
    })

    it('空文字は無効 (required)', () => {
      const result = streamMessageParamsSchema.safeParse({ sessionId: '' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDを入力してください')
    })

    it('空白のみは無効 (required)', () => {
      const result = streamMessageParamsSchema.safeParse({ sessionId: '   ' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('セッションIDを入力してください')
    })
  })
})

describe('streamMessageBodySchema', () => {
  describe('content', () => {
    it('1文字以上の文字列は有効', () => {
      const result = streamMessageBodySchema.safeParse({ content: 'こんにちは' })
      expect(result.success).toBe(true)
    })

    it('必須項目のため未指定は無効', () => {
      const result = streamMessageBodySchema.safeParse({})
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('メッセージ内容は文字列で指定してください')
    })

    it('undefinedは無効', () => {
      const result = streamMessageBodySchema.safeParse({ content: undefined })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('メッセージ内容は文字列で指定してください')
    })

    it('nullは無効', () => {
      const result = streamMessageBodySchema.safeParse({ content: null })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('メッセージ内容は文字列で指定してください')
    })

    it('数値は無効', () => {
      const result = streamMessageBodySchema.safeParse({ content: 123 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('メッセージ内容は文字列で指定してください')
    })

    it('空文字は無効 (required)', () => {
      const result = streamMessageBodySchema.safeParse({ content: '' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('メッセージ内容を入力してください')
    })

    it('空白のみは無効 (required)', () => {
      const result = streamMessageBodySchema.safeParse({ content: '   ' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('メッセージ内容を入力してください')
    })
  })
})
