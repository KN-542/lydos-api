import { describe, expect, it } from 'bun:test'
import { createSessionBodySchema } from './createSession'

describe('createSessionBodySchema', () => {
  describe('modelId', () => {
    it('正の整数は有効', () => {
      const result = createSessionBodySchema.safeParse({ modelId: 1 })
      expect(result.success).toBe(true)
    })

    it('必須項目のため未指定は無効', () => {
      const result = createSessionBodySchema.safeParse({})
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('AIモデルIDは数値で指定してください')
    })

    it('文字列は無効', () => {
      const result = createSessionBodySchema.safeParse({ modelId: '1' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('AIモデルIDは数値で指定してください')
    })

    it('0は無効 (positive)', () => {
      const result = createSessionBodySchema.safeParse({ modelId: 0 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('AIモデルIDは1以上の値を指定してください')
    })

    it('負の値は無効', () => {
      const result = createSessionBodySchema.safeParse({ modelId: -1 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('AIモデルIDは1以上の値を指定してください')
    })

    it('小数は無効 (int)', () => {
      const result = createSessionBodySchema.safeParse({ modelId: 1.5 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('AIモデルIDは整数で指定してください')
    })
  })

  describe('title', () => {
    it('省略可能', () => {
      const result = createSessionBodySchema.safeParse({ modelId: 1 })
      expect(result.success).toBe(true)
    })

    it('1文字は有効 (min)', () => {
      const result = createSessionBodySchema.safeParse({ modelId: 1, title: 'a' })
      expect(result.success).toBe(true)
    })

    it('255文字は有効 (max)', () => {
      const result = createSessionBodySchema.safeParse({ modelId: 1, title: 'a'.repeat(255) })
      expect(result.success).toBe(true)
    })

    it('空文字は無効 (min 1)', () => {
      const result = createSessionBodySchema.safeParse({ modelId: 1, title: '' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(
        'セッションタイトルは1文字以上で入力してください'
      )
    })

    it('256文字は無効 (max 255)', () => {
      const result = createSessionBodySchema.safeParse({ modelId: 1, title: 'a'.repeat(256) })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(
        'セッションタイトルは255文字以内で入力してください'
      )
    })
  })
})
