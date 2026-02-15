import type { PrismaClient } from '@prisma/client'
import type { IMPlanRepository } from '../domain/interface/mPlan'
import type { IStripeRepository } from '../domain/interface/stripe'
import type { ITStripeCustomerRepository } from '../domain/interface/tStripeCustomer'
import { TAuthIdVO } from '../domain/model/mPlan'
import { CreateTStripeCustomerVO, TStripeCustomerVO } from '../domain/model/tStripeCustomer'
import type { CreateCheckoutSessionRequestDTO } from './dto/request/setting/createCheckoutSession'
import type { DeletePaymentMethodRequestDTO } from './dto/request/setting/deletePaymentMethod'
import type { GetPaymentMethodsRequestDTO } from './dto/request/setting/getPaymentMethods'
import type { GetPlansRequestDTO } from './dto/request/setting/getPlans'
import { CreateCheckoutSessionResponseDTO } from './dto/response/setting/createCheckoutSession'
import { DeletePaymentMethodResponseDTO } from './dto/response/setting/deletePaymentMethod'
import { GetPaymentMethodsResponseDTO } from './dto/response/setting/getPaymentMethods'
import { GetPlansResponseDTO } from './dto/response/setting/getPlans'

const MAX_PAYMENT_METHODS = 5

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
        } else {
          const existing = await this.stripeRepository.getPaymentMethods(stripeCustomer)
          if (existing.length >= MAX_PAYMENT_METHODS) {
            throw Object.assign(
              new Error(`支払い方法の登録上限（${MAX_PAYMENT_METHODS}件）に達しています`),
              { code: 'PAYMENT_METHOD_LIMIT_EXCEEDED' }
            )
          }
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

  async deletePaymentMethod(
    dto: DeletePaymentMethodRequestDTO
  ): Promise<DeletePaymentMethodResponseDTO> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const { authId, paymentMethodId } = dto
        const vo = new TStripeCustomerVO(authId)

        const aggregation = await this.tStripeCustomerRepository.find(tx, vo)
        if (aggregation === null) {
          throw new Error('User not found')
        }
        if (aggregation.stripeCustomerId === null) {
          throw new Error('Stripe customer not found')
        }

        // 所有権の確認: 該当ユーザーのCustomerに紐づくPayment Methodか検証
        const paymentMethods = await this.stripeRepository.getPaymentMethods(
          aggregation.stripeCustomerId
        )
        const owns = paymentMethods.some((pm) => pm.id === paymentMethodId)
        if (!owns) {
          throw new Error('Payment method not found')
        }

        await this.stripeRepository.detachPaymentMethod(paymentMethodId)
      })

      return new DeletePaymentMethodResponseDTO()
    } catch (error) {
      console.error('Error in SettingService.deletePaymentMethod:', error)
      throw error
    }
  }
}
