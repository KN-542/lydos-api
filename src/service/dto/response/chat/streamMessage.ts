export class StreamMessageResponseDTO {
  readonly messageId: number
  readonly inputTokens: number
  readonly outputTokens: number

  constructor(messageId: number, inputTokens: number, outputTokens: number) {
    this.messageId = messageId
    this.inputTokens = inputTokens
    this.outputTokens = outputTokens
  }
}
