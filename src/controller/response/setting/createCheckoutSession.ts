import { z } from 'zod'
import type { CreateCheckoutSessionResponseDTO } from '../../../service/dto/response/setting/createCheckoutSession'

export const createCheckoutSessionResponseSchema = z.object({
  checkoutUrl: z.string().describe('Stripe Checkout Session URL'),
})

export class CreateCheckoutSessionResponse {
  readonly checkoutUrl: string

  constructor(dto: CreateCheckoutSessionResponseDTO) {
    this.checkoutUrl = dto.checkoutUrl
  }
}
