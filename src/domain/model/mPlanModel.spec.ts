import { describe, expect, it } from 'bun:test'
import { MPlanModelEntity, PlanModelVO } from './mPlanModel'

// --- PlanModelVO ---

const validVO = { planId: 1, modelId: 2 }
const makeVO = (override: Partial<typeof validVO> = {}) =>
  new PlanModelVO(override.planId ?? validVO.planId, override.modelId ?? validVO.modelId)

describe('PlanModelVO', () => {
  it('正常な値でインスタンスを生成できる', () => {
    const vo = makeVO()
    expect(vo.planId).toBe(validVO.planId)
    expect(vo.modelId).toBe(validVO.modelId)
  })

  describe('planId', () => {
    it('正の整数は有効', () => {
      expect(makeVO({ planId: 1 }).planId).toBe(1)
    })

    it('0は無効', () => {
      expect(() => makeVO({ planId: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => makeVO({ planId: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => makeVO({ planId: 1.5 })).toThrow()
    })
  })

  describe('modelId', () => {
    it('正の整数は有効', () => {
      expect(makeVO({ modelId: 1 }).modelId).toBe(1)
    })

    it('0は無効', () => {
      expect(() => makeVO({ modelId: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => makeVO({ modelId: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => makeVO({ modelId: 2.5 })).toThrow()
    })
  })
})

// --- MPlanModelEntity ---

const validEntity = { planId: 1, modelId: 2 }
const makeEntity = (override: Partial<typeof validEntity> = {}) =>
  new MPlanModelEntity(
    override.planId ?? validEntity.planId,
    override.modelId ?? validEntity.modelId
  )

describe('MPlanModelEntity', () => {
  it('正常な値でインスタンスを生成できる', () => {
    const entity = makeEntity()
    expect(entity.planId).toBe(validEntity.planId)
    expect(entity.modelId).toBe(validEntity.modelId)
  })

  describe('planId', () => {
    it('正の整数は有効', () => {
      expect(makeEntity({ planId: 1 }).planId).toBe(1)
    })

    it('0は無効', () => {
      expect(() => makeEntity({ planId: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => makeEntity({ planId: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => makeEntity({ planId: 1.5 })).toThrow()
    })
  })

  describe('modelId', () => {
    it('正の整数は有効', () => {
      expect(makeEntity({ modelId: 1 }).modelId).toBe(1)
    })

    it('0は無効', () => {
      expect(() => makeEntity({ modelId: 0 })).toThrow()
    })

    it('負の値は無効', () => {
      expect(() => makeEntity({ modelId: -1 })).toThrow()
    })

    it('小数は無効', () => {
      expect(() => makeEntity({ modelId: 2.5 })).toThrow()
    })
  })
})
