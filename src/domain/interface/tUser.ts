import type { Prisma } from '@prisma/client'
import type { TUserAggregation, UpdateUserVO } from '../model/tUser'

export interface ITUserRepository {
  findByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<TUserAggregation | null>
  update(tx: Prisma.TransactionClient, vo: UpdateUserVO): Promise<void>
}
