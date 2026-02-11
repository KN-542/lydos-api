import type { PrismaClient } from '@prisma/client'
import type { IMPlanRepository } from '../domain/interface/mPlan'
import type { IStripeRepository } from '../domain/interface/stripe'
import type { ITStripeCustomerRepository } from '../domain/interface/tStripeCustomer'
import { TAuthIdVO } from '../domain/model/mPlan'
import { CreateTStripeCustomerVO, TStripeCustomerVO } from '../domain/model/tStripeCustomer'
import type { CreateCheckoutSessionRequestDTO } from './dto/request/setting/createCheckoutSession'
import type { GetPaymentMethodsRequestDTO } from './dto/request/setting/getPaymentMethods'
import type { GetPlansRequestDTO } from './dto/request/setting/getPlans'
import { CreateCheckoutSessionResponseDTO } from './dto/response/setting/createCheckoutSession'
import { GetPaymentMethodsResponseDTO } from './dto/response/setting/getPaymentMethods'
import { GetPlansResponseDTO } from './dto/response/setting/getPlans'

export class SettingService {
  readonly planRepository: IMPlanRepository
  readonly stripeRepository: IStripeRepository
  readonly tStripeCustomerRepository: ITStripeCustomerRepository
  readonly prisma: PrismaClient

  constructor(
    planRepository: IMPlanRepository,
    stripeRepository: IStripeRepository,
    tStripeCustomerRepository: ITStripeCustomerRepository,
    prisma: PrismaClient
  ) {
    this.planRepository = planRepository
    this.stripeRepository = stripeRepository
    this.tStripeCustomerRepository = tStripeCustomerRepository
    this.prisma = prisma
  }

  async getPlans(dto: GetPlansRequestDTO): Promise<GetPlansResponseDTO> {
    try {
      const entities = await this.prisma.$transaction(async (tx) => {
        const { authId } = dto
        const vo = new TAuthIdVO(authId)

        return await this.planRepository.findAll(tx, vo)
      })

      return new GetPlansResponseDTO(entities)
    } catch (error) {
      console.error('Error in SettingService.getPlans:', error)
      throw error
    }
  }

  async createCheckoutSession(
    dto: CreateCheckoutSessionRequestDTO
  ): Promise<CreateCheckoutSessionResponseDTO> {
    try {
      const checkoutUrl = await this.prisma.$transaction(async (tx) => {
        const { authId } = dto
        const vo = new TStripeCustomerVO(authId)

        const aggregation = await this.tStripeCustomerRepository.find(tx, vo)
        if (aggregation === null) {
          throw new Error('User not found')
        }

        let stripeCustomer = aggregation.stripeCustomerId
        if (stripeCustomer === null) {
          const stripeCustomerId = await this.stripeRepository.createCustomer(
            aggregation.email,
            aggregation.name
          )

          const createVO = new CreateTStripeCustomerVO(aggregation.userId, stripeCustomerId)
          await this.tStripeCustomerRepository.create(tx, createVO)
          stripeCustomer = stripeCustomerId
        }

        const successUrl = `${process.env.FRONTEND_URL}/home/setting/payment/success`
        const cancelUrl = `${process.env.FRONTEND_URL}/home/setting/payment`

        const checkoutUrl = await this.stripeRepository.createCheckoutSession(
          stripeCustomer,
          successUrl,
          cancelUrl
        )

        return checkoutUrl
      })

      return new CreateCheckoutSessionResponseDTO(checkoutUrl)
    } catch (error) {
      console.error('Error in SettingService.createCheckoutSession:', error)
      throw error
    }
  }

  async getPaymentMethods(dto: GetPaymentMethodsRequestDTO): Promise<GetPaymentMethodsResponseDTO> {
    try {
      const paymentMethods = await this.prisma.$transaction(async (tx) => {
        const { authId } = dto
        const vo = new TStripeCustomerVO(authId)

        const aggregation = await this.tStripeCustomerRepository.find(tx, vo)
        if (aggregation === null) {
          throw new Error('User not found')
        }

        // Stripe Customerが未作成の場合は空配列を返す
        if (aggregation.stripeCustomerId === null) {
          return []
        }

        return await this.stripeRepository.getPaymentMethods(aggregation.stripeCustomerId)
      })

      return new GetPaymentMethodsResponseDTO(paymentMethods)
    } catch (error) {
      console.error('Error in SettingService.getPaymentMethods:', error)
      throw error
    }
  }
}
