import { z } from 'zod'

const mPlanSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(25),
  description: z.string(),
  price: z.number().int().min(0),
  createdAt: z.date(),
})

// Entity: プラン
export class MPlanEntity {
  readonly id: number
  readonly name: string
  readonly description: string
  readonly price: number
  readonly createdAt: Date

  constructor(id: number, name: string, description: string, price: number, createdAt: Date) {
    const validated = mPlanSchema.parse({ id, name, description, price, createdAt })

    this.id = validated.id
    this.name = validated.name
    this.description = validated.description
    this.price = validated.price
    this.createdAt = validated.createdAt
  }
}
