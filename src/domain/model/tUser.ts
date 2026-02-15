import { z } from 'zod'
import { required } from '../../lib/zod'

// Aggregation: プラン変更に必要なユーザー情報
const tUserPlanAggregationSchema = z.object({
  userId: z.number().int().positive(),
  currentPlanId: z.number().int().positive(),
  stripeCustomerId: z.string().nullable(),
  stripeCustomerInternalId: z.number().int().positive().nullable(),
  stripeSubscriptionId: z.string().nullable(),
})
export class TUserPlanAggregation {
  readonly userId: number
  readonly currentPlanId: number
  readonly stripeCustomerId: string | null
  readonly stripeCustomerInternalId: number | null
  readonly stripeSubscriptionId: string | null

  constructor(
    userId: number,
    currentPlanId: number,
    stripeCustomerId: string | null,
    stripeCustomerInternalId: number | null,
    stripeSubscriptionId: string | null
  ) {
    const validated = tUserPlanAggregationSchema.parse({
      userId,
      currentPlanId,
      stripeCustomerId,
      stripeCustomerInternalId,
      stripeSubscriptionId,
    })
    this.userId = validated.userId
    this.currentPlanId = validated.currentPlanId
    this.stripeCustomerId = validated.stripeCustomerId
    this.stripeCustomerInternalId = validated.stripeCustomerInternalId
    this.stripeSubscriptionId = validated.stripeSubscriptionId
  }
}

// VO: プラン変更ユーザー検索用
const tUserPlanChangeVOSchema = z.object({
  authId: required(),
})
export class TUserPlanChangeVO {
  readonly authId: string

  constructor(authId: string) {
    const validated = tUserPlanChangeVOSchema.parse({ authId })
    this.authId = validated.authId
  }
}

// VO: プラン更新用
export class UpdateUserPlanVO {
  readonly userId: number
  readonly planId: number
  readonly stripeSubscriptionId: string | null
  readonly stripeCustomerInternalId: number | null
  readonly stripePaymentMethodId: string

  constructor(
    userId: number,
    planId: number,
    stripeSubscriptionId: string | null,
    stripeCustomerInternalId: number | null,
    stripePaymentMethodId: string
  ) {
    this.userId = userId
    this.planId = planId
    this.stripeSubscriptionId = stripeSubscriptionId
    this.stripeCustomerInternalId = stripeCustomerInternalId
    this.stripePaymentMethodId = stripePaymentMethodId
  }
}
