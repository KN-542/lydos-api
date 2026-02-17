import { describe, expect, it } from 'bun:test'
import { changePlanBodySchema } from './changePlan'

describe('changePlanBodySchema', () => {
  describe('planId', () => {
    it('有効なプランIDは有効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1, paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(true)
    })

    it('文字列は無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: '1', paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('プランIDは数値で指定してください')
    })

    it('nullは無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: null, paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('プランIDは数値で指定してください')
    })

    it('小数は無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1.5, paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('プランIDは整数で指定してください')
    })

    it('0は無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 0, paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('プランIDは1以上の値を指定してください')
    })

    it('負数は無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: -1, paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('プランIDは1以上の値を指定してください')
    })

    it('フィールド省略は無効', () => {
      const result = changePlanBodySchema.safeParse({ paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('プランIDは数値で指定してください')
    })
  })

  describe('paymentMethodId', () => {
    it('有効な Stripe 決済IDは有効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1, paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(true)
    })

    it('前後の空白はトリムされて有効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1, paymentMethodId: '  pm_abc123  ' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.paymentMethodId).toBe('pm_abc123')
    })

    it('空文字は無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1, paymentMethodId: '' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDを入力してください')
    })

    it('空白のみは無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1, paymentMethodId: '   ' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDを入力してください')
    })

    it('pm_ で始まらない文字列は無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1, paymentMethodId: 'card_abc123' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは pm_ で始まる必要があります')
    })

    it('nullは無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1, paymentMethodId: null })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは文字列で指定してください')
    })

    it('数値は無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1, paymentMethodId: 123 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは文字列で指定してください')
    })

    it('フィールド省略は無効', () => {
      const result = changePlanBodySchema.safeParse({ planId: 1 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは文字列で指定してください')
    })
  })
})
