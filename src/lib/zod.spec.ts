import { describe, expect, it } from 'bun:test'
import { required } from './zod'

describe('required()', () => {
  it('有効な文字列はそのまま通す', () => {
    expect(required().parse('hello')).toBe('hello')
  })

  it('前後の空白を trim して検証する', () => {
    expect(required().parse('  hello  ')).toBe('hello')
  })

  it('空文字はエラー', () => {
    expect(() => required().parse('')).toThrow()
  })

  it('空白のみはエラー（trim 後に空文字になるため）', () => {
    expect(() => required().parse('   ')).toThrow()
  })

  it('数値はエラー', () => {
    expect(() => required().parse(123)).toThrow()
  })

  it('null はエラー', () => {
    expect(() => required().parse(null)).toThrow()
  })

  it('undefined はエラー', () => {
    expect(() => required().parse(undefined)).toThrow()
  })

  it('カスタムエラーメッセージがエラー内容に含まれる', () => {
    let error: unknown
    try {
      required('必須項目です').parse('')
    } catch (e) {
      error = e
    }
    expect(JSON.stringify(error)).toContain('必須項目です')
  })
})
