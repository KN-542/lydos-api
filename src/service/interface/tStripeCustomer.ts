import type { Prisma } from '@prisma/client'
import type {
  CreateTStripeCustomerVO,
  TStripeCustomerAggregation,
  TStripeCustomerEntity,
  TStripeCustomerVO,
} from '../../domain/model/tStripeCustomer'

export interface ITStripeCustomerRepository {
  find(
    tx: Prisma.TransactionClient,
    vo: TStripeCustomerVO
  ): Promise<TStripeCustomerAggregation | null>
  create(tx: Prisma.TransactionClient, vo: CreateTStripeCustomerVO): Promise<TStripeCustomerEntity>
}
