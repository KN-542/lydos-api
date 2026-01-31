import type { MPlanEntity } from '../../../../domain/model/mPlan'

export class GetPlansResponseDTO {
  readonly plans: Array<{
    id: number
    name: string
    description: string
    price: number
    isSelected: boolean
  }>

  constructor(entities: MPlanEntity[]) {
    this.plans = entities.map(({ ...rest }) => rest)
  }
}
