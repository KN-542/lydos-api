import { z } from 'zod'
import { required } from '../../lib/zod'

const stripeCustomerIdSchema = z.string().min(1).startsWith('cus_')

// Entity: Stripe顧客情報
const tStripeCustomerEntitySchema = z.object({
  id: z.number().int().positive(),
  stripeCustomerId: stripeCustomerIdSchema,
})
export class TStripeCustomerEntity {
  readonly id: number
  readonly stripeCustomerId: string

  constructor(id: number, stripeCustomerId: string) {
    const validated = tStripeCustomerEntitySchema.parse({
      id,
      stripeCustomerId,
    })

    this.id = validated.id
    this.stripeCustomerId = validated.stripeCustomerId
  }
}

// authId検索用VO
const tStripeCustomerVOSchema = z.object({
  authId: required(),
})
export class TStripeCustomerVO {
  readonly authId: string

  constructor(authId: string) {
    const validated = tStripeCustomerVOSchema.parse({ authId })
    this.authId = validated.authId
  }
}

// Stripe Customer作成用VO
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

// Aggregation: ユーザーとStripe顧客情報
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
