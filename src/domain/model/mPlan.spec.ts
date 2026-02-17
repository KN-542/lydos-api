import { describe, expect, it } from 'bun:test'
import { MPlanEntity } from './mPlan'

const valid = { id: 1, name: 'Free', description: 'フリープラン', price: 0, isSelected: false }
const make = (override: Partial<typeof valid> = {}) =>
  new MPlanEntity(
    override.id ?? valid.id,
    override.name ?? valid.name,
    override.description ?? valid.description,
    override.price ?? valid.price,
    override.isSelected ?? valid.isSelected
  )

describe('MPlanEntity', () => {
  it('正常な値でインスタンスを生成できる', () => {
    const entity = make()
    expect(entity.id).toBe(valid.id)
    expect(entity.name).toBe(valid.name)
    expect(entity.description).toBe(valid.description)
    expect(entity.price).toBe(valid.price)
    expect(entity.isSelected).toBe(valid.isSelected)
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

    it('25文字は有効', () => {
      const name = 'a'.repeat(25)
      expect(make({ name }).name).toBe(name)
    })

    it('空文字は無効', () => {
      expect(() => make({ name: '' })).toThrow()
    })

    it('26文字は無効', () => {
      expect(() => make({ name: 'a'.repeat(26) })).toThrow()
    })
  })

  describe('description', () => {
    it('空文字は有効', () => {
      expect(make({ description: '' }).description).toBe('')
    })

    it('任意の文字列は有効', () => {
      expect(make({ description: '詳細説明' }).description).toBe('詳細説明')
    })
  })

  describe('price', () => {
    it('0は有効', () => {
      expect(make({ price: 0 }).price).toBe(0)
    })

    it('正の整数は有効', () => {
      expect(make({ price: 500 }).price).toBe(500)
    })

    it('負の値は無効', () => {
      expect(() => make({ price: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => make({ price: 100.5 })).toThrow()
    })
  })

  describe('isSelected', () => {
    it('trueは有効', () => {
      expect(make({ isSelected: true }).isSelected).toBe(true)
    })

    it('falseは有効', () => {
      expect(make({ isSelected: false }).isSelected).toBe(false)
    })
  })
})
