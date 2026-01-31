import { z } from 'zod'

const mPlanSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(25),
  description: z.string(),
  price: z.number().int().min(0),
})

// Entity: ユーザープラン
export class MPlanEntity {
  readonly id: number
  readonly name: string
  readonly description: string
  readonly price: number
  readonly isSelected: boolean

  constructor(id: number, name: string, description: string, price: number, isSelected: boolean) {
    const validated = mPlanSchema.parse({
      id,
      name,
      description,
      price,
      isSelected,
    })

    this.id = validated.id
    this.name = validated.name
    this.description = validated.description
    this.price = validated.price
    this.isSelected = isSelected
  }
}

// authId VO
export class TAuthIdVO {
  readonly authId: string

  constructor(authId: string) {
    this.authId = authId
  }
}
