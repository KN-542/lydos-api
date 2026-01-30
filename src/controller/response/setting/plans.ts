import { z } from 'zod'

const planResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: '無料プラン' }),
  description: z.string().openapi({ example: '基本的な機能が利用できます' }),
  price: z.number().openapi({ example: 0 }),
  isSelected: z.boolean().openapi({ example: false }),
})

export const plansResponseSchema = z.object({
  plans: z.array(planResponseSchema),
})

export type PlansResponse = z.infer<typeof plansResponseSchema>
