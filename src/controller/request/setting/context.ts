import type { HonoContext } from '../../..'

export function toRequestDTO<T>(c: HonoContext, DTOConstructor: new (authId: string) => T): T {
  const authId = c.get('authId')
  return new DTOConstructor(authId)
}
