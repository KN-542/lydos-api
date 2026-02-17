import type { Prisma } from '@prisma/client'
import type {
  CreateSessionVO,
  CreateTChatSessionEntity,
  SessionVO,
  TChatSessionAggregation,
  TChatSessionEntity,
  UpdateSessionVO,
} from '../model/tChatSession'

export interface ITChatSessionRepository {
  findAllByAuthId(tx: Prisma.TransactionClient, authId: string): Promise<TChatSessionEntity[]>
  create(tx: Prisma.TransactionClient, vo: CreateSessionVO): Promise<CreateTChatSessionEntity>
  find(tx: Prisma.TransactionClient, vo: SessionVO): Promise<TChatSessionAggregation | null>
  update(tx: Prisma.TransactionClient, vo: UpdateSessionVO): Promise<void>
  delete(tx: Prisma.TransactionClient, vo: SessionVO): Promise<void>
}
