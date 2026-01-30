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
}
