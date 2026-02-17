import type { Prisma } from '@prisma/client'
import type { CreateMessageVO, TChatHistoryEntity } from '../model/tChatHistory'
import type { SessionVO } from '../model/tChatSession'

export interface ITChatHistoryRepository {
  findMany(tx: Prisma.TransactionClient, vo: SessionVO): Promise<TChatHistoryEntity[]>
  create(tx: Prisma.TransactionClient, vo: CreateMessageVO): Promise<TChatHistoryEntity>
}
