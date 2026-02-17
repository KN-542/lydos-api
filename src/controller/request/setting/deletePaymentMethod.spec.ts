import { describe, expect, it } from 'bun:test'
import { deletePaymentMethodParamsSchema } from './deletePaymentMethod'

describe('deletePaymentMethodParamsSchema', () => {
  describe('paymentMethodId', () => {
    it('有効な Stripe 決済IDは有効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({ paymentMethodId: 'pm_abc123' })
      expect(result.success).toBe(true)
    })

    it('前後の空白はトリムされて有効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({ paymentMethodId: '  pm_abc123  ' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.paymentMethodId).toBe('pm_abc123')
    })

    it('空文字は無効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({ paymentMethodId: '' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDを入力してください')
    })

    it('空白のみは無効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({ paymentMethodId: '   ' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDを入力してください')
    })

    it('pm_ で始まらない文字列は無効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({ paymentMethodId: 'card_abc123' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは pm_ で始まる必要があります')
    })

    it('nullは無効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({ paymentMethodId: null })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは文字列で指定してください')
    })

    it('数値は無効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({ paymentMethodId: 123 })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは文字列で指定してください')
    })

    it('undefinedは無効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({ paymentMethodId: undefined })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは文字列で指定してください')
    })

    it('フィールド省略は無効', () => {
      const result = deletePaymentMethodParamsSchema.safeParse({})
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Stripe決済IDは文字列で指定してください')
    })
  })
})
