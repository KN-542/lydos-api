import { serviceRequestDTO } from '../abstract'

export class ChangePlanRequestDTO extends serviceRequestDTO {
  readonly planId: number
  readonly paymentMethodId: string

  constructor(authId: string, planId: number, paymentMethodId: string) {
    super(authId)
    this.planId = planId
    this.paymentMethodId = paymentMethodId
  }
}
