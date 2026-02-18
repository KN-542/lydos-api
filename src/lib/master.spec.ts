import { describe, expect, it } from 'bun:test'
import { MASTER } from './master'

describe('MASTER.getPlanId', () => {
  it('FREE → 1', () => {
    expect(MASTER.getPlanId(MASTER.PLAN.FREE)).toBe(1)
  })

  it('PAID → 2', () => {
    expect(MASTER.getPlanId(MASTER.PLAN.PAID)).toBe(2)
  })
})

describe('MASTER.getModelId', () => {
  it('GEMINI_2_0_FLASH → 1', () => {
    expect(MASTER.getModelId(MASTER.MODEL.GEMINI_2_0_FLASH)).toBe(1)
  })

  it('GEMINI_2_5_FLASH → 2', () => {
    expect(MASTER.getModelId(MASTER.MODEL.GEMINI_2_5_FLASH)).toBe(2)
  })

  it('GROQ_LLAMA_3_3_70B → 3', () => {
    expect(MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_3_70B)).toBe(3)
  })

  it('GROQ_LLAMA_3_1_8B → 4', () => {
    expect(MASTER.getModelId(MASTER.MODEL.GROQ_LLAMA_3_1_8B)).toBe(4)
  })
})
