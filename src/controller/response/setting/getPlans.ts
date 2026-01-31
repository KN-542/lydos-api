import { z } from 'zod'
import type { GetPlansResponseDTO } from '../../../service/dto/response/setting/getPlans'

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

export class GetPlansResponse {
  readonly plans: Array<{
    id: number
    name: string
    description: string
    price: number
    isSelected: boolean
  }>

  constructor(dto: GetPlansResponseDTO) {
    this.plans = dto.plans
  }
}
