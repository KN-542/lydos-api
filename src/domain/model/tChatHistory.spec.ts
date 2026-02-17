import { describe, expect, it } from 'bun:test'
import { CreateMessageVO, TChatHistoryEntity } from './tChatHistory'

describe('CreateMessageVO', () => {
  const make = (
    override: {
      sessionId?: string
      role?: 'user' | 'assistant'
      content?: string
      inputTokens?: number | null
      outputTokens?: number | null
    } = {}
  ) =>
    new CreateMessageVO(
      override.sessionId ?? 'session-1',
      override.role ?? 'user',
      override.content ?? 'こんにちは',
      override.inputTokens !== undefined ? override.inputTokens : null,
      override.outputTokens !== undefined ? override.outputTokens : null
    )

  it('正常な値でインスタンスを生成できる', () => {
    const vo = make()
    expect(vo.sessionId).toBe('session-1')
    expect(vo.role).toBe('user')
    expect(vo.content).toBe('こんにちは')
    expect(vo.inputTokens).toBeNull()
    expect(vo.outputTokens).toBeNull()
  })

  describe('sessionId', () => {
    it('空文字は無効', () => {
      expect(() => make({ sessionId: '' })).toThrow()
    })

    it('空白のみは無効', () => {
      expect(() => make({ sessionId: '   ' })).toThrow()
    })
  })

  describe('role', () => {
    it('user は有効', () => {
      expect(make({ role: 'user' }).role).toBe('user')
    })

    it('assistant は有効', () => {
      expect(make({ role: 'assistant' }).role).toBe('assistant')
    })

    it('それ以外は無効', () => {
      expect(() => make({ role: 'system' as 'user' })).toThrow()
    })
  })

  describe('content', () => {
    it('1文字以上は有効', () => {
      expect(make({ content: 'a' }).content).toBe('a')
    })

    it('空文字は無効', () => {
      expect(() => make({ content: '' })).toThrow()
    })
  })

  describe('inputTokens / outputTokens', () => {
    it('null は有効', () => {
      expect(make({ inputTokens: null }).inputTokens).toBeNull()
    })

    it('0は有効', () => {
      expect(make({ inputTokens: 0 }).inputTokens).toBe(0)
    })

    it('正の整数は有効', () => {
      expect(make({ outputTokens: 100 }).outputTokens).toBe(100)
    })

    it('負の値は無効', () => {
      expect(() => make({ inputTokens: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => make({ outputTokens: 1.5 })).toThrow()
    })
  })
})

describe('TChatHistoryEntity', () => {
  const make = (
    override: {
      id?: number
      role?: 'user' | 'assistant'
      content?: string
      inputTokens?: number | null
      outputTokens?: number | null
      createdAt?: Date
    } = {}
  ) =>
    new TChatHistoryEntity(
      override.id ?? 1,
      override.role ?? 'assistant',
      override.content ?? 'はい、承知しました。',
      override.inputTokens !== undefined ? override.inputTokens : null,
      override.outputTokens !== undefined ? override.outputTokens : null,
      override.createdAt ?? new Date('2024-01-01')
    )

  it('正常な値でインスタンスを生成できる', () => {
    const entity = make()
    expect(entity.id).toBe(1)
    expect(entity.role).toBe('assistant')
    expect(entity.content).toBe('はい、承知しました。')
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
  })

  describe('content', () => {
    it('空文字は有効（DBからの取得値として許容）', () => {
      expect(make({ content: '' }).content).toBe('')
    })
  })

  describe('role', () => {
    it('user / assistant のみ有効', () => {
      expect(make({ role: 'user' }).role).toBe('user')
      expect(make({ role: 'assistant' }).role).toBe('assistant')
    })

    it('それ以外は無効', () => {
      expect(() => make({ role: 'system' as 'user' })).toThrow()
    })
  })
})
