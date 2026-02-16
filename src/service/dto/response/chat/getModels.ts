import type { MModelEntity } from '../../../../domain/model/chat'

export class GetModelsResponseDTO {
  readonly models: Array<{
    id: number
    name: string
    modelId: string
    provider: string
    color: string
    isDefault: boolean
  }>

  constructor(entities: MModelEntity[]) {
    this.models = entities.map(({ ...rest }) => rest)
  }
}
