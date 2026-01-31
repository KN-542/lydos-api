import { z } from 'zod'
import type { GetPaymentMethodsResponseDTO } from '../../../service/dto/response/setting/getPaymentMethods'

const paymentMethodSchema = z.object({
  id: z.string().describe('Payment Method ID'),
  brand: z.string().describe('Card brand (visa, mastercard, etc.)'),
  last4: z.string().describe('Last 4 digits of card'),
  expMonth: z.number().describe('Expiration month'),
  expYear: z.number().describe('Expiration year'),
})

export const getPaymentMethodsResponseSchema = z.object({
  paymentMethods: z.array(paymentMethodSchema).describe('List of payment methods'),
})

export class GetPaymentMethodsResponse {
  readonly paymentMethods: Array<{
    id: string
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }>

  constructor(dto: GetPaymentMethodsResponseDTO) {
    this.paymentMethods = dto.paymentMethods.map((pm) => ({
      id: pm.id,
      brand: pm.brand,
      last4: pm.last4,
      expMonth: pm.expMonth,
      expYear: pm.expYear,
    }))
  }
}
