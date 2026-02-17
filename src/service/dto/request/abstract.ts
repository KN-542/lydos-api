/**
 * @package
 */
export abstract class serviceRequestDTO {
  readonly authId: string

  constructor(authId: string) {
    this.authId = authId
  }
}
