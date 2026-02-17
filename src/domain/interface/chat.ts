import type { Prisma } from '@prisma/client'
import type { MModelEntity } from '../model/mModel'
import type { CreateMessageVO, TChatHistoryEntity } from '../model/tChatHistory'
import type {
  CreateSessionVO,
  CreateTChatSessionEntity,
  SessionVO,
  TChatSessionEntity,
  UpdateSessionVO,
} from '../model/tChatSession'

export type TChatSessionAggregation = {
  session: TChatSessionEntity
  model: MModelEntity
}

export interface IMModelRepository {
  findAll(tx: Prisma.TransactionClient): Promise<MModelEntity[]>
  findById(tx: Prisma.TransactionClient, id: number): Promise<MModelEntity | null>
}

export interface ITChatSessionRepository {
  findAllByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<TChatSessionEntity[]>
  create(tx: Prisma.TransactionClient, vo: CreateSessionVO): Promise<CreateTChatSessionEntity>
  find(tx: Prisma.TransactionClient, vo: SessionVO): Promise<TChatSessionAggregation | null>
  update(tx: Prisma.TransactionClient, vo: UpdateSessionVO): Promise<void>
  delete(tx: Prisma.TransactionClient, vo: SessionVO): Promise<void>
}

export interface ITChatHistoryRepository {
  findMany(tx: Prisma.TransactionClient, vo: SessionVO): Promise<TChatHistoryEntity[]>
  create(tx: Prisma.TransactionClient, vo: CreateMessageVO): Promise<TChatHistoryEntity>
}
