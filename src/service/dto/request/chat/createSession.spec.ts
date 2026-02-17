// title 未指定時に '新しいチャット' をデフォルト設定するロジックを持つため、他の DTO と異なりテストを記述する
import { describe, expect, it } from 'bun:test'
import { CreateSessionRequestDTO } from './createSession'

describe('CreateSessionRequestDTO', () => {
  describe('title', () => {
    it('title を指定した場合はその値が使われる', () => {
      const dto = new CreateSessionRequestDTO('auth-1', 1, 'マイチャット')
      expect(dto.title).toBe('マイチャット')
    })

    it('title を省略した場合は「新しいチャット」がデフォルト設定される', () => {
      const dto = new CreateSessionRequestDTO('auth-1', 1)
      expect(dto.title).toBe('新しいチャット')
    })

    it('title が空文字の場合は無効', () => {
      expect(() => new CreateSessionRequestDTO('auth-1', 1, '')).toThrow()
    })

    it('title が256文字以上の場合は無効', () => {
      expect(() => new CreateSessionRequestDTO('auth-1', 1, 'a'.repeat(256))).toThrow()
    })

    it('title が255文字は有効', () => {
      const dto = new CreateSessionRequestDTO('auth-1', 1, 'a'.repeat(255))
      expect(dto.title).toBe('a'.repeat(255))
    })
  })

  describe('modelId', () => {
    it('正の整数は有効', () => {
      const dto = new CreateSessionRequestDTO('auth-1', 3)
      expect(dto.modelId).toBe(3)
    })

    it('0は無効', () => {
      expect(() => new CreateSessionRequestDTO('auth-1', 0)).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => new CreateSessionRequestDTO('auth-1', -1)).toThrow()
    })

    it('小数は無効', () => {
      expect(() => new CreateSessionRequestDTO('auth-1', 1.5)).toThrow()
    })
  })
})
