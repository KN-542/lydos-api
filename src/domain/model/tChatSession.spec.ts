import { describe, expect, it } from 'bun:test'
import {
  CreateSessionVO,
  CreateTChatSessionEntity,
  SessionVO,
  TChatSessionEntity,
  UpdateSessionVO,
} from './tChatSession'

describe('CreateSessionVO', () => {
  const make = (override: { userId?: number; modelId?: number; title?: string } = {}) =>
    new CreateSessionVO(override.userId ?? 1, override.modelId ?? 1, override.title ?? 'チャット')

  it('正常な値でインスタンスを生成できる', () => {
    const vo = make()
    expect(vo.userId).toBe(1)
    expect(vo.modelId).toBe(1)
    expect(vo.title).toBe('チャット')
  })

  describe('userId / modelId', () => {
    it('0は無効', () => {
      expect(() => make({ userId: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => make({ modelId: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => make({ userId: 1.5 })).toThrow()
    })
  })

  describe('title', () => {
    it('1文字は有効', () => {
      expect(make({ title: 'a' }).title).toBe('a')
    })

    it('255文字は有効', () => {
      const title = 'a'.repeat(255)
      expect(make({ title }).title).toBe(title)
    })

    it('空文字は無効', () => {
      expect(() => make({ title: '' })).toThrow()
    })

    it('256文字は無効', () => {
      expect(() => make({ title: 'a'.repeat(256) })).toThrow()
    })
  })
})

describe('UpdateSessionVO', () => {
  it('sessionId のみでインスタンスを生成できる（title は任意）', () => {
    const vo = new UpdateSessionVO('session-1')
    expect(vo.sessionId).toBe('session-1')
    expect(vo.title).toBeUndefined()
  })

  it('title を指定した場合はその値が使われる', () => {
    const vo = new UpdateSessionVO('session-1', { title: '新タイトル' })
    expect(vo.title).toBe('新タイトル')
  })

  describe('sessionId', () => {
    it('空文字は無効', () => {
      expect(() => new UpdateSessionVO('')).toThrow()
    })

    it('空白のみは無効', () => {
      expect(() => new UpdateSessionVO('   ')).toThrow()
    })
  })

  describe('title', () => {
    it('255文字は有効', () => {
      const title = 'a'.repeat(255)
      expect(new UpdateSessionVO('session-1', { title }).title).toBe(title)
    })

    it('空文字は無効', () => {
      expect(() => new UpdateSessionVO('session-1', { title: '' })).toThrow()
    })

    it('256文字は無効', () => {
      expect(() => new UpdateSessionVO('session-1', { title: 'a'.repeat(256) })).toThrow()
    })
  })
})

describe('SessionVO', () => {
  it('正常な値でインスタンスを生成できる', () => {
    const vo = new SessionVO('auth_abc', 'session-1')
    expect(vo.authId).toBe('auth_abc')
    expect(vo.sessionId).toBe('session-1')
  })

  describe('authId', () => {
    it('空文字は無効', () => {
      expect(() => new SessionVO('', 'session-1')).toThrow()
    })

    it('空白のみは無効', () => {
      expect(() => new SessionVO('   ', 'session-1')).toThrow()
    })
  })

  describe('sessionId', () => {
    it('空文字は無効', () => {
      expect(() => new SessionVO('auth_abc', '')).toThrow()
    })

    it('空白のみは無効', () => {
      expect(() => new SessionVO('auth_abc', '   ')).toThrow()
    })
  })
})

describe('CreateTChatSessionEntity', () => {
  it('正常な値でインスタンスを生成できる', () => {
    const entity = new CreateTChatSessionEntity('session-1')
    expect(entity.id).toBe('session-1')
  })

  it('空文字は無効', () => {
    expect(() => new CreateTChatSessionEntity('')).toThrow()
  })
})

describe('TChatSessionEntity', () => {
  const make = (
    override: { id?: string; title?: string; modelId?: number; modelName?: string } = {}
  ) =>
    new TChatSessionEntity(
      override.id ?? 'session-1',
      override.title ?? 'チャット',
      override.modelId ?? 1,
      override.modelName ?? 'Gemini 1.5 Pro'
    )

  it('正常な値でインスタンスを生成できる', () => {
    const entity = make()
    expect(entity.id).toBe('session-1')
    expect(entity.title).toBe('チャット')
    expect(entity.modelId).toBe(1)
    expect(entity.modelName).toBe('Gemini 1.5 Pro')
  })

  describe('id / title / modelName', () => {
    it('空文字は無効', () => {
      expect(() => make({ id: '' })).toThrow()
      expect(() => make({ title: '' })).toThrow()
      expect(() => make({ modelName: '' })).toThrow()
    })
  })

  describe('modelId', () => {
    it('0は無効', () => {
      expect(() => make({ modelId: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => make({ modelId: -1 })).toThrow()
    })
  })
})
