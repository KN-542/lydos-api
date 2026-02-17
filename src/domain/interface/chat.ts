import type { Prisma } from '@prisma/client'
import type { MModelEntity } from '../model/mModel'
import type { CreateMessageVO, FindBySessionVO, TChatHistoryEntity } from '../model/tChatHistory'
import type {
  CreateSessionVO,
  CreateTChatSessionEntity,
  DeleteSessionVO,
  TChatSessionEntity,
} from '../model/tChatSession'

export type TChatSessionWithModel = {
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
  findWithModel(
    tx: Prisma.TransactionClient,
    vo: DeleteSessionVO
  ): Promise<TChatSessionWithModel | null>
  touchUpdatedAt(tx: Prisma.TransactionClient, sessionId: string): Promise<void>
  delete(tx: Prisma.TransactionClient, vo: DeleteSessionVO): Promise<void>
}

export interface ITChatHistoryRepository {
  findBySession(tx: Prisma.TransactionClient, vo: FindBySessionVO): Promise<TChatHistoryEntity[]>
  create(tx: Prisma.TransactionClient, vo: CreateMessageVO): Promise<TChatHistoryEntity>
}
