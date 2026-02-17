import type { Prisma } from '@prisma/client'
import type {
  ChatAuthVO,
  CreateMessageVO,
  CreateSessionVO,
  MModelEntity,
  SessionOwnerVO,
  TChatHistoryEntity,
  TChatSessionCreateEntity,
  TChatSessionEntity,
} from '../model/chat'

export type TChatSessionWithModel = {
  session: TChatSessionEntity
  model: MModelEntity
}

export interface IMModelRepository {
  findAll(tx: Prisma.TransactionClient): Promise<MModelEntity[]>
  findById(tx: Prisma.TransactionClient, id: number): Promise<MModelEntity | null>
}

export interface ITChatSessionRepository {
  findAll(tx: Prisma.TransactionClient, vo: ChatAuthVO): Promise<TChatSessionEntity[]>
  create(tx: Prisma.TransactionClient, vo: CreateSessionVO): Promise<TChatSessionCreateEntity>
  findWithModel(
    tx: Prisma.TransactionClient,
    vo: SessionOwnerVO
  ): Promise<TChatSessionWithModel | null>
  touchUpdatedAt(tx: Prisma.TransactionClient, sessionId: string): Promise<void>
  delete(tx: Prisma.TransactionClient, vo: SessionOwnerVO): Promise<void>
}

export interface ITChatHistoryRepository {
  findBySession(tx: Prisma.TransactionClient, vo: SessionOwnerVO): Promise<TChatHistoryEntity[]>
  create(tx: Prisma.TransactionClient, vo: CreateMessageVO): Promise<TChatHistoryEntity>
}
