import { z } from 'zod'
import { required } from '../../lib/zod'

const stripeCustomerIdSchema = z.string().min(1).startsWith('cus_')

// VO: Stripe Customer 作成用（userId + stripeCustomerId）
const createTStripeCustomerVOSchema = z.object({
  userId: z.number().int().positive(),
  stripeCustomerId: stripeCustomerIdSchema,
})
export class CreateTStripeCustomerVO {
  readonly userId: number
  readonly stripeCustomerId: string

  constructor(userId: number, stripeCustomerId: string) {
    const validated = createTStripeCustomerVOSchema.parse({
      userId,
      stripeCustomerId,
    })

    this.userId = validated.userId
    this.stripeCustomerId = validated.stripeCustomerId
  }
}

// Aggregation: ユーザー基本情報 + Stripe 顧客 ID
const tStripeCustomerAggregationSchema = z.object({
  userId: z.number().int().positive(),
  email: required(),
  name: required(),
  stripeCustomerId: stripeCustomerIdSchema.nullable(),
})
export class TStripeCustomerAggregation {
  readonly userId: number
  readonly email: string
  readonly name: string
  readonly stripeCustomerId: string | null

  constructor(userId: number, email: string, name: string, stripeCustomerId: string | null) {
    const validated = tStripeCustomerAggregationSchema.parse({
      userId,
      email,
      name,
      stripeCustomerId,
    })

    this.userId = validated.userId
    this.email = validated.email
    this.name = validated.name
    this.stripeCustomerId = validated.stripeCustomerId
  }
}
