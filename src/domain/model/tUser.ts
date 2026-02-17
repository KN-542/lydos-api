import { z } from 'zod'
import { required } from '../../lib/zod'

// VO: ユーザー情報更新用（任意フィールドを指定して部分更新）
export class UpdateUserVO {
  readonly userId: number
  readonly planId?: number
  readonly stripeSubscriptionId?: string | null
  readonly name?: string
  readonly email?: string
  readonly imageUrl?: string | null

  constructor(
    userId: number,
    fields: {
      planId?: number
      stripeSubscriptionId?: string | null
      name?: string
      email?: string
      imageUrl?: string | null
    }
  ) {
    this.userId = userId
    this.planId = fields.planId
    this.stripeSubscriptionId = fields.stripeSubscriptionId
    this.name = fields.name
    this.email = fields.email
    this.imageUrl = fields.imageUrl
  }
}

// Aggregation: ユーザー全情報（プラン・Stripe 連携情報を含む）
const tUserAggregationSchema = z.object({
  userId: z.number().int().positive(),
  authId: required(),
  name: required(),
  email: z.email(),
  imageUrl: z.string().nullable(),
  planId: z.number().int().positive(),
  stripeCustomerId: z.string().nullable(),
  stripeCustomerInternalId: z.number().int().positive().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export class TUserAggregation {
  readonly userId: number
  readonly authId: string
  readonly name: string
  readonly email: string
  readonly imageUrl: string | null
  readonly planId: number
  readonly stripeCustomerId: string | null
  readonly stripeCustomerInternalId: number | null
  readonly stripeSubscriptionId: string | null
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(
    userId: number,
    authId: string,
    name: string,
    email: string,
    imageUrl: string | null,
    planId: number,
    stripeCustomerId: string | null,
    stripeCustomerInternalId: number | null,
    stripeSubscriptionId: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    const v = tUserAggregationSchema.parse({
      userId,
      authId,
      name,
      email,
      imageUrl,
      planId,
      stripeCustomerId,
      stripeCustomerInternalId,
      stripeSubscriptionId,
      createdAt,
      updatedAt,
    })
    this.userId = v.userId
    this.authId = v.authId
    this.name = v.name
    this.email = v.email
    this.imageUrl = v.imageUrl
    this.planId = v.planId
    this.stripeCustomerId = v.stripeCustomerId
    this.stripeCustomerInternalId = v.stripeCustomerInternalId
    this.stripeSubscriptionId = v.stripeSubscriptionId
    this.createdAt = v.createdAt
    this.updatedAt = v.updatedAt
  }
}
