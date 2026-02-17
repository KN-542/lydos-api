import { afterAll, afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { CreateMessageVO } from '../domain/model/tChatHistory'
import { SessionVO } from '../domain/model/tChatSession'
import { MASTER } from '../lib/master'
import { TChatHistoryRepository } from './tChatHistory'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})
const repo = new TChatHistoryRepository(prisma)

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

const freePlanId = MASTER.getPlanId(MASTER.PLAN.FREE)
const defaultModelId = MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH)

const createUser = (suffix: string) =>
  tx.tUser.create({
    data: {
      authId: `tch-${suffix}`,
      name: '山田太郎',
      email: `tch-${suffix}@test.com`,
      planId: freePlanId,
    },
  })

const createSession = (userId: number) =>
  tx.tChatSession.create({
    data: { userId, modelId: defaultModelId, title: 'テストチャット' },
    select: { id: true },
  })

describe('TChatHistoryRepository', () => {
  describe('create', () => {
    it('メッセージを作成して TChatHistoryEntity を返す', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)

      const result = await repo.create(
        tx,
        new CreateMessageVO(s.id, 'user', 'こんにちは', null, null)
      )

      expect(result.id).toBeGreaterThan(0)
      expect(result.role).toBe('user')
      expect(result.content).toBe('こんにちは')
      expect(result.inputTokens).toBeNull()
      expect(result.outputTokens).toBeNull()
      expect(result.createdAt).toBeInstanceOf(Date)
    })

    it('トークン数を指定して作成できる', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)

      const result = await repo.create(
        tx,
        new CreateMessageVO(s.id, 'assistant', '返答です', 100, 200)
      )

      expect(result.role).toBe('assistant')
      expect(result.inputTokens).toBe(100)
      expect(result.outputTokens).toBe(200)
    })
  })

  describe('findMany', () => {
    it('セッションにメッセージがない場合は空配列を返す', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)

      const result = await repo.findMany(tx, new SessionVO(user.authId, s.id))
      expect(result).toEqual([])
    })

    it('メッセージを createdAt 昇順で返す', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)
      const vo = new SessionVO(user.authId, s.id)

      await repo.create(tx, new CreateMessageVO(s.id, 'user', '1番目', null, null))
      await repo.create(tx, new CreateMessageVO(s.id, 'assistant', '2番目', null, null))
      await repo.create(tx, new CreateMessageVO(s.id, 'user', '3番目', null, null))

      const result = await repo.findMany(tx, vo)

      expect(result).toHaveLength(3)
      expect(result[0].content).toBe('1番目')
      expect(result[1].content).toBe('2番目')
      expect(result[2].content).toBe('3番目')
    })

    it('authId が異なる場合は空配列を返す', async () => {
      const user = await createUser('1')
      const s = await createSession(user.id)
      await repo.create(tx, new CreateMessageVO(s.id, 'user', 'メッセージ', null, null))

      const result = await repo.findMany(tx, new SessionVO('tch-other', s.id))
      expect(result).toEqual([])
    })

    it('他のセッションのメッセージは含まれない', async () => {
      const user = await createUser('1')
      const s1 = await createSession(user.id)
      const s2 = await createSession(user.id)

      await repo.create(
        tx,
        new CreateMessageVO(s1.id, 'user', 'セッション1のメッセージ', null, null)
      )
      await repo.create(
        tx,
        new CreateMessageVO(s2.id, 'user', 'セッション2のメッセージ', null, null)
      )

      const result = await repo.findMany(tx, new SessionVO(user.authId, s1.id))

      expect(result).toHaveLength(1)
      expect(result[0].content).toBe('セッション1のメッセージ')
    })
  })
})
