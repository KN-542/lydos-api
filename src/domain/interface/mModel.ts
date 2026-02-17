import type { Prisma } from '@prisma/client'
import type { MModelEntity } from '../model/mModel'

export interface IMModelRepository {
  findAll(tx: Prisma.TransactionClient): Promise<MModelEntity[]>
  findById(tx: Prisma.TransactionClient, id: number): Promise<MModelEntity | null>
}
