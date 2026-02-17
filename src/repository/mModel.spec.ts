import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test'
import { PrismaClient } from '@prisma/client'
import { MASTER } from '../lib/master'
import { MModelRepository } from './mModel'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_TEST_URL } },
})
const repo = new MModelRepository(prisma)

// beforeAll でシード直後の状態をスナップショットとして取得し、afterEach で復元する
let snapshot: Awaited<ReturnType<typeof prisma.mModel.findMany>> = []

beforeAll(async () => {
  snapshot = await prisma.mModel.findMany()
})

afterEach(async () => {
  // スナップショット外のレコードを削除してから upsert でシード状態に戻す
  await prisma.mModel.deleteMany({ where: { id: { notIn: snapshot.map((m) => m.id) } } })
  for (const model of snapshot) {
    await prisma.mModel.upsert({ where: { id: model.id }, update: model, create: model })
  }
})

afterAll(() => prisma.$disconnect())

describe('MModelRepository', () => {
  describe('findAll', () => {
    it('シードで投入した全モデルを id 昇順で返す', async () => {
      const models = await prisma.$transaction((tx) => repo.findAll(tx))

      expect(models).toHaveLength(snapshot.length)
      expect(models[0].id).toBe(MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH))
      expect(models[1].id).toBe(MASTER.getModelId(MASTER.MODEL.GEMINI_2_5_FLASH))
      expect(models[2].id).toBe(MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_3_70B))
      expect(models[3].id).toBe(MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_1_8B))
    })

    it('返却値は MModelEntity のプロパティを持つ', async () => {
      const models = await prisma.$transaction((tx) => repo.findAll(tx))
      const first = models[0]

      expect(first.name).toBe('Gemini 2.0 Flash')
      expect(first.modelId).toBe(MASTER.MODEL.GEMINI_2_0_FLASH)
      expect(first.provider).toBe('gemini')
      expect(first.color).toBe('#4285F4')
      expect(first.isDefault).toBe(true)
    })
  })

  describe('find', () => {
    it('存在する id を指定した場合は該当モデルを返す', async () => {
      const id = MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH)
      const model = await prisma.$transaction((tx) => repo.find(tx, id))

      expect(model).not.toBeNull()
      expect(model?.id).toBe(id)
      expect(model?.name).toBe('Gemini 2.0 Flash')
    })

    it('存在しない id を指定した場合は null を返す', async () => {
      const model = await prisma.$transaction((tx) => repo.find(tx, 9999))
      expect(model).toBeNull()
    })
  })
})
