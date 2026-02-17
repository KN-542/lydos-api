import type { TChatHistoryEntity } from '../../../../domain/model/tChatHistory'

export class GetMessagesResponseDTO {
  readonly messages: Array<{
    id: number
    role: 'user' | 'assistant'
    content: string
    inputTokens: number | null
    outputTokens: number | null
    createdAt: Date
  }>

  constructor(entities: TChatHistoryEntity[]) {
    this.messages = entities.map(({ ...rest }) => rest)
  }
}
