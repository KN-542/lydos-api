import type { Prisma } from '@prisma/client'
import type {
  CreateTStripeCustomerVO,
  TStripeCustomerAggregation,
} from '../../domain/model/tStripeCustomer'

export interface ITStripeCustomerRepository {
  findByAuthId(
    tx: Prisma.TransactionClient,
    authId: string
  ): Promise<TStripeCustomerAggregation | null>
  create(tx: Prisma.TransactionClient, vo: CreateTStripeCustomerVO): Promise<void>
}
