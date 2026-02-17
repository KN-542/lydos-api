import { describe, expect, it } from 'bun:test'
import { MModelEntity } from './mModel'

const valid = {
  id: 1,
  name: 'Gemini 1.5 Pro',
  modelId: 'gemini-1.5-pro',
  provider: 'google',
  color: '#4285F4',
  isDefault: false,
}
const make = (override: Partial<typeof valid> = {}) =>
  new MModelEntity(
    override.id ?? valid.id,
    override.name ?? valid.name,
    override.modelId ?? valid.modelId,
    override.provider ?? valid.provider,
    override.color ?? valid.color,
    override.isDefault ?? valid.isDefault
  )

describe('MModelEntity', () => {
  it('正常な値でインスタンスを生成できる', () => {
    const entity = make()
    expect(entity.id).toBe(valid.id)
    expect(entity.name).toBe(valid.name)
    expect(entity.modelId).toBe(valid.modelId)
    expect(entity.provider).toBe(valid.provider)
    expect(entity.color).toBe(valid.color)
    expect(entity.isDefault).toBe(valid.isDefault)
  })

  describe('id', () => {
    it('正の整数は有効', () => {
      expect(make({ id: 1 }).id).toBe(1)
    })

    it('0は無効', () => {
      expect(() => make({ id: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => make({ id: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => make({ id: 1.5 })).toThrow()
    })
  })

  describe('name', () => {
    it('1文字は有効', () => {
      expect(make({ name: 'a' }).name).toBe('a')
    })

    it('100文字は有効', () => {
      const name = 'a'.repeat(100)
      expect(make({ name }).name).toBe(name)
    })

    it('空文字は無効', () => {
      expect(() => make({ name: '' })).toThrow()
    })

    it('101文字は無効', () => {
      expect(() => make({ name: 'a'.repeat(101) })).toThrow()
    })
  })

  describe('modelId', () => {
    it('1文字以上は有効', () => {
      expect(make({ modelId: 'gpt-4' }).modelId).toBe('gpt-4')
    })

    it('空文字は無効', () => {
      expect(() => make({ modelId: '' })).toThrow()
    })
  })

  describe('provider', () => {
    it('1文字以上は有効', () => {
      expect(make({ provider: 'openai' }).provider).toBe('openai')
    })

    it('空文字は無効', () => {
      expect(() => make({ provider: '' })).toThrow()
    })
  })

  describe('color', () => {
    it('7文字は有効', () => {
      expect(make({ color: '#ffffff' }).color).toBe('#ffffff')
    })

    it('6文字は無効', () => {
      expect(() => make({ color: 'ffffff' })).toThrow()
    })

    it('8文字は無効', () => {
      expect(() => make({ color: '#fffffff' })).toThrow()
    })
  })

  describe('isDefault', () => {
    it('trueは有効', () => {
      expect(make({ isDefault: true }).isDefault).toBe(true)
    })

    it('falseは有効', () => {
      expect(make({ isDefault: false }).isDefault).toBe(false)
    })
  })
})
