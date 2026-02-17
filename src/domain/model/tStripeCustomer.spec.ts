import { describe, expect, it } from 'bun:test'
import { CreateTStripeCustomerVO, TStripeCustomerAggregation } from './tStripeCustomer'

describe('CreateTStripeCustomerVO', () => {
  const make = (override: { userId?: number; stripeCustomerId?: string } = {}) =>
    new CreateTStripeCustomerVO(override.userId ?? 1, override.stripeCustomerId ?? 'cus_abc123')

  it('正常な値でインスタンスを生成できる', () => {
    const vo = make()
    expect(vo.userId).toBe(1)
    expect(vo.stripeCustomerId).toBe('cus_abc123')
  })

  describe('userId', () => {
    it('正の整数は有効', () => {
      expect(make({ userId: 1 }).userId).toBe(1)
    })

    it('0は無効', () => {
      expect(() => make({ userId: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => make({ userId: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => make({ userId: 1.5 })).toThrow()
    })
  })

  describe('stripeCustomerId', () => {
    it('cus_ から始まる文字列は有効', () => {
      expect(make({ stripeCustomerId: 'cus_xyz' }).stripeCustomerId).toBe('cus_xyz')
    })

    it('cus_ 以外から始まる文字列は無効', () => {
      expect(() => make({ stripeCustomerId: 'sub_abc' })).toThrow()
    })

    it('空文字は無効', () => {
      expect(() => make({ stripeCustomerId: '' })).toThrow()
    })
  })
})

describe('TStripeCustomerAggregation', () => {
  const make = (
    override: {
      userId?: number
      email?: string
      name?: string
      stripeCustomerId?: string | null
    } = {}
  ) =>
    new TStripeCustomerAggregation(
      override.userId ?? 1,
      override.email ?? 'user@example.com',
      override.name ?? '山田太郎',
      override.stripeCustomerId !== undefined ? override.stripeCustomerId : 'cus_abc123'
    )

  it('正常な値でインスタンスを生成できる', () => {
    const agg = make()
    expect(agg.userId).toBe(1)
    expect(agg.email).toBe('user@example.com')
    expect(agg.name).toBe('山田太郎')
    expect(agg.stripeCustomerId).toBe('cus_abc123')
  })

  describe('email', () => {
    it('空文字は無効', () => {
      expect(() => make({ email: '' })).toThrow()
    })

    it('空白のみは無効', () => {
      expect(() => make({ email: '   ' })).toThrow()
    })
  })

  describe('name', () => {
    it('空文字は無効', () => {
      expect(() => make({ name: '' })).toThrow()
    })

    it('空白のみは無効', () => {
      expect(() => make({ name: '   ' })).toThrow()
    })
  })

  describe('stripeCustomerId', () => {
    it('nullは有効', () => {
      expect(make({ stripeCustomerId: null }).stripeCustomerId).toBeNull()
    })

    it('cus_ から始まる文字列は有効', () => {
      expect(make({ stripeCustomerId: 'cus_xyz' }).stripeCustomerId).toBe('cus_xyz')
    })

    it('cus_ 以外から始まる文字列は無効', () => {
      expect(() => make({ stripeCustomerId: 'sub_abc' })).toThrow()
    })
  })
})
