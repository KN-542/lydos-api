import { describe, expect, it } from 'bun:test'
import { createCheckoutSessionBodySchema } from './createCheckoutSession'

describe('createCheckoutSessionBodySchema', () => {
  describe('successUrl', () => {
    it('省略可能', () => {
      const result = createCheckoutSessionBodySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('有効なURLは有効', () => {
      const result = createCheckoutSessionBodySchema.safeParse({
        successUrl: 'https://example.com/success',
      })
      expect(result.success).toBe(true)
    })

    it('undefinedは有効 (optional)', () => {
      const result = createCheckoutSessionBodySchema.safeParse({ successUrl: undefined })
      expect(result.success).toBe(true)
    })

    it('不正なURLは無効', () => {
      const result = createCheckoutSessionBodySchema.safeParse({ successUrl: 'not-a-url' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('有効なURLを入力してください')
    })

    it('nullは無効', () => {
      const result = createCheckoutSessionBodySchema.safeParse({ successUrl: null })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('有効なURLを入力してください')
    })

    it('数値は無効', () => {
      const result = createCheckoutSessionBodySchema.safeParse({ successUrl: 123 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('有効なURLを入力してください')
    })
  })

  describe('cancelUrl', () => {
    it('省略可能', () => {
      const result = createCheckoutSessionBodySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('有効なURLは有効', () => {
      const result = createCheckoutSessionBodySchema.safeParse({
        cancelUrl: 'https://example.com/cancel',
      })
      expect(result.success).toBe(true)
    })

    it('undefinedは有効 (optional)', () => {
      const result = createCheckoutSessionBodySchema.safeParse({ cancelUrl: undefined })
      expect(result.success).toBe(true)
    })

    it('不正なURLは無効', () => {
      const result = createCheckoutSessionBodySchema.safeParse({ cancelUrl: 'not-a-url' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('有効なURLを入力してください')
    })

    it('nullは無効', () => {
      const result = createCheckoutSessionBodySchema.safeParse({ cancelUrl: null })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('有効なURLを入力してください')
    })

    it('数値は無効', () => {
      const result = createCheckoutSessionBodySchema.safeParse({ cancelUrl: 123 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('有効なURLを入力してください')
    })
  })
})
