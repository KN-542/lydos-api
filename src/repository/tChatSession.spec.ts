import { afterAll, afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { CreateSessionVO, SessionVO, UpdateSessionVO } from '../domain/model/tChatSession'
import { MASTER } from '../lib/master'
import { TChatSessionRepository } from './tChatSession'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})
const repo = new TChatSessionRepository(prisma)

let tx: Prisma.TransactionClient
let triggerRollback: () => void

beforeEach(async () => {
  await new Promise<void>((ready) => {
    prisma
      .$transaction(
        async (t) => {
          tx = t
          ready()
          await new Promise<void>((_, reject) => {
            triggerRollback = () => reject(new Error('rollback'))
          })
        },
        { timeout: 30_000 }
      )
      .catch(() => {})
  })
})

afterEach(() => {
  triggerRollback()
})

afterAll(() => prisma.$disconnect())

const defaultModelId = MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH)
const freePlanId = MASTER.getPlanId(MASTER.PLAN.FREE)

const createUser = (suffix: string) =>
  tx.tUser.create({
    data: {
      authId: `tcs-${suffix}`,
      name: '山田太郎',
      email: `tcs-${suffix}@test.com`,
      planId: freePlanId,
    },
  })

const createSession = (userId: number, title = 'テストチャット', modelId = defaultModelId) =>
  tx.tChatSession.create({
    data: { userId, modelId, title },
    select: { id: true },
  })

describe('TChatSessionRepository', () => {
  describe('create', () => {
    it('セッションを作成して id を返す', async () => {
      const user = await createUser('1')
      const vo = new CreateSessionVO(user.id, defaultModelId, 'はじめてのチャット')

      const result = await repo.create(tx, vo)

      expect(result.id).toBeString()
      expect(result.id.length).toBeGreaterThan(0)
    })
  })

  describe('findAllByAuthId', () => {
    it('存在しない authId の場合は空配列を返す', async () => {
      const result = await repo.findAllByAuthId(tx, 'tcs-unknown')
      expect(result).toEqual([])
    })

    it('ユーザーのセッションを updatedAt 降順で返す', async () => {
      const user = await createUser('1')
      const s1 = await createSession(user.id, 'チャット1')
      const s2 = await createSession(user.id, 'チャット2')
      await tx.tChatSession.update({ where: { id: s2.id }, data: { updatedAt: new Date() } })

      const result = await repo.findAllByAuthId(tx, user.authId)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(s2.id)
      expect(result[1].id).toBe(s1.id)
    })

    it('他のユーザーのセッションは含まれない', async () => {
      const userA = await createUser('a')
      const userB = await createUser('b')
      await createSession(userA.id, 'Aのチャット')
      await createSession(userB.id, 'Bのチャット')

      const result = await repo.findAllByAuthId(tx, userA.authId)

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Aのチャット')
    })

    it('セッションがない場合は空配列を返す', async () => {
      const user = await createUser('1')
      const result = await repo.findAllByAuthId(tx, user.authId)
      expect(result).toEqual([])
    })
  })

  describe('find', () => {
    it('sessionId と authId が一致するセッションを返す', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)

      const result = await repo.find(tx, new SessionVO(user.authId, s.id))

      expect(result).not.toBeNull()
      expect(result?.session.id).toBe(s.id)
      expect(result?.session.title).toBe('テストチャット')
      expect(result?.model.id).toBe(defaultModelId)
    })

    it('authId が異なる場合は null を返す', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)

      const result = await repo.find(tx, new SessionVO('tcs-other', s.id))
      expect(result).toBeNull()
    })

    it('存在しない sessionId の場合は null を返す', async () => {
      const user = await createUser('1')

      const result = await repo.find(tx, new SessionVO(user.authId, 'nonexistent-id'))
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('updatedAt が更新される', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)
      const past = new Date('2020-01-01')
      await tx.tChatSession.update({ where: { id: s.id }, data: { updatedAt: past } })

      await repo.update(tx, new UpdateSessionVO(s.id))

      const updated = await tx.tChatSession.findUnique({ where: { id: s.id } })
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(past.getTime())
    })

    it('title を指定した場合は title も更新される', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id, '旧タイトル')

      await repo.update(tx, new UpdateSessionVO(s.id, { title: '新タイトル' }))

      const updated = await tx.tChatSession.findUnique({ where: { id: s.id } })
      expect(updated?.title).toBe('新タイトル')
    })

    it('title を指定しない場合は title は変わらない', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id, '元のタイトル')

      await repo.update(tx, new UpdateSessionVO(s.id))

      const updated = await tx.tChatSession.findUnique({ where: { id: s.id } })
      expect(updated?.title).toBe('元のタイトル')
    })
  })

  describe('delete', () => {
    it('sessionId と authId が一致するセッションを削除する', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)

      await repo.delete(tx, new SessionVO(user.authId, s.id))

      const deleted = await tx.tChatSession.findUnique({ where: { id: s.id } })
      expect(deleted).toBeNull()
    })

    it('authId が異なる場合はセッションが削除されない', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)

      await repo.delete(tx, new SessionVO('tcs-other', s.id))

      const still = await tx.tChatSession.findUnique({ where: { id: s.id } })
      expect(still).not.toBeNull()
    })
  })
})
