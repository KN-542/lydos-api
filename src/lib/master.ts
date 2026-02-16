/**
 * マスタデータ
 */
export namespace MASTER {
  /**
   * プランマスタ
   */
  export const PLAN = {
    FREE: '無料プラン',
    PAID: '有料プラン',
  } as const

  export type Plan = (typeof PLAN)[keyof typeof PLAN]

  export const getPlanId = (plan: Plan) => {
    switch (plan) {
      case PLAN.FREE:
        return 1
      case PLAN.PAID:
        return 2
      default:
        throw new Error('Invalid plan')
    }
  }

  /**
   * AIモデルマスタ
   */
  export const MODEL = {
    GEMINI_2_0_FLASH: 'gemini-2.0-flash',
    GEMINI_2_5_FLASH: 'gemini-2.5-flash',
    GROQ_LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
    GROQ_LLAMA_3_1_8B: 'llama-3.1-8b-instant',
  } as const

  export type Model = (typeof MODEL)[keyof typeof MODEL]

  export const getModelId = (model: Model) => {
    switch (model) {
      case MODEL.GEMINI_2_0_FLASH:
        return 1
      case MODEL.GEMINI_2_5_FLASH:
        return 2
      case MODEL.GROQ_LLAMA_3_3_70B:
        return 3
      case MODEL.GROQ_LLAMA_3_1_8B:
        return 4
      default:
        throw new Error('Invalid model')
    }
  }
}
