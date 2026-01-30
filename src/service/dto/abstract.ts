export abstract class serviceDTO {
  readonly authId: string

  constructor(authId: string) {
    this.authId = authId
  }
}
