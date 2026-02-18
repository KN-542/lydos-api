import type { Prisma } from '@prisma/client'
import type { MModelEntity } from '../model/mModel'

export interface IMModelRepository {
  findAllByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<MModelEntity[]>
  find(tx: Prisma.TransactionClient, id: number): Promise<MModelEntity | null>
}
