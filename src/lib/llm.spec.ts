import { describe, expect, it } from 'bun:test'
import { extractErrorMessage, streamChat } from './llm'

describe('extractErrorMessage()', () => {
  it('JSON でないメッセージはそのまま返す', () => {
    expect(extractErrorMessage(new Error('plain error'))).toBe('plain error')
  })

  it('outer JSON の error.message を返す', () => {
    const msg = JSON.stringify({ error: { message: 'Rate limit exceeded', code: 429 } })
    expect(extractErrorMessage(new Error(msg))).toBe('Rate limit exceeded')
  })

  it('inner も JSON の場合はさらにネストした message を返す', () => {
    const inner = JSON.stringify({ error: { message: 'Quota exceeded for model' } })
    const outer = JSON.stringify({ error: { message: inner, code: 429 } })
    expect(extractErrorMessage(new Error(outer))).toBe('Quota exceeded for model')
  })

  it('outer JSON に error.message がない場合は元のメッセージを返す', () => {
    const msg = JSON.stringify({ error: { code: 429 } })
    expect(extractErrorMessage(new Error(msg))).toBe(msg)
  })

  it('outer JSON に error キーがない場合は元のメッセージを返す', () => {
    const msg = JSON.stringify({ code: 429 })
    expect(extractErrorMessage(new Error(msg))).toBe(msg)
  })
})

describe('streamChat()', () => {
  it('未知の provider は throw する', async () => {
    const error = await streamChat([], 'model-id', 'unknown', async () => {}).catch((e) => e)
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toContain('Unknown provider: unknown')
  })
})
