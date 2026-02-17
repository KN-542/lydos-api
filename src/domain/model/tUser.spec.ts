import { describe, expect, it } from 'bun:test'
import { TUserAggregation, UpdateUserVO } from './tUser'

describe('UpdateUserVO', () => {
  it('全フィールドを指定してインスタンスを生成できる', () => {
    const vo = new UpdateUserVO(1, {
      planId: 2,
      stripeSubscriptionId: 'sub_abc',
      name: '山田太郎',
      email: 'user@example.com',
      imageUrl: 'https://example.com/avatar.png',
    })
    expect(vo.userId).toBe(1)
    expect(vo.planId).toBe(2)
    expect(vo.stripeSubscriptionId).toBe('sub_abc')
    expect(vo.name).toBe('山田太郎')
    expect(vo.email).toBe('user@example.com')
    expect(vo.imageUrl).toBe('https://example.com/avatar.png')
  })

  it('フィールドを省略した場合は undefined になる', () => {
    const vo = new UpdateUserVO(1, {})
    expect(vo.planId).toBeUndefined()
    expect(vo.stripeSubscriptionId).toBeUndefined()
    expect(vo.name).toBeUndefined()
    expect(vo.email).toBeUndefined()
    expect(vo.imageUrl).toBeUndefined()
  })

  it('stripeSubscriptionId に null を指定できる', () => {
    const vo = new UpdateUserVO(1, { stripeSubscriptionId: null })
    expect(vo.stripeSubscriptionId).toBeNull()
  })

  it('imageUrl に null を指定できる', () => {
    const vo = new UpdateUserVO(1, { imageUrl: null })
    expect(vo.imageUrl).toBeNull()
  })
})

describe('TUserAggregation', () => {
  const validArgs = {
    userId: 1,
    authId: 'auth_abc',
    name: '山田太郎',
    email: 'user@example.com',
    imageUrl: null as string | null,
    planId: 1,
    stripeCustomerId: null as string | null,
    stripeCustomerInternalId: null as number | null,
    stripeSubscriptionId: null as string | null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
  const make = (override: Partial<typeof validArgs> = {}) => {
    const a = { ...validArgs, ...override }
    return new TUserAggregation(
      a.userId,
      a.authId,
      a.name,
      a.email,
      a.imageUrl,
      a.planId,
      a.stripeCustomerId,
      a.stripeCustomerInternalId,
      a.stripeSubscriptionId,
      a.createdAt,
      a.updatedAt
    )
  }

  it('正常な値でインスタンスを生成できる', () => {
    const agg = make()
    expect(agg.userId).toBe(1)
    expect(agg.authId).toBe('auth_abc')
    expect(agg.email).toBe('user@example.com')
  })

  describe('userId / planId', () => {
    it('0は無効', () => {
      expect(() => make({ userId: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => make({ planId: -1 })).toThrow()
    })
  })

  describe('authId / name', () => {
    it('空文字は無効', () => {
      expect(() => make({ authId: '' })).toThrow()
    })

    it('空白のみは無効', () => {
      expect(() => make({ name: '   ' })).toThrow()
    })
  })

  describe('email', () => {
    it('メールアドレス形式でない場合は無効', () => {
      expect(() => make({ email: 'not-an-email' })).toThrow()
    })
  })

  describe('nullable フィールド', () => {
    it('imageUrl は null を許容する', () => {
      expect(make({ imageUrl: null }).imageUrl).toBeNull()
    })

    it('stripeCustomerId は null を許容する', () => {
      expect(make({ stripeCustomerId: null }).stripeCustomerId).toBeNull()
    })

    it('stripeCustomerInternalId は null を許容する', () => {
      expect(make({ stripeCustomerInternalId: null }).stripeCustomerInternalId).toBeNull()
    })

    it('stripeSubscriptionId は null を許容する', () => {
      expect(make({ stripeSubscriptionId: null }).stripeSubscriptionId).toBeNull()
    })
  })
})
