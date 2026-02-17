import type { PrismaClient } from '@prisma/client'
import type { IMPlanRepository } from '../domain/interface/mPlan'
import type { IStripe } from '../domain/interface/stripe'
import type { ITStripeCustomerRepository } from '../domain/interface/tStripeCustomer'
import type { ITUserRepository } from '../domain/interface/tUser'
import { CreateTStripeCustomerVO } from '../domain/model/tStripeCustomer'
import { UpdateUserVO } from '../domain/model/tUser'
import { AppError } from '../lib/error'
import type { ChangePlanRequestDTO } from './dto/request/setting/changePlan'
import type { CreateCheckoutSessionRequestDTO } from './dto/request/setting/createCheckoutSession'
import type { DeletePaymentMethodRequestDTO } from './dto/request/setting/deletePaymentMethod'
import type { GetPaymentMethodsRequestDTO } from './dto/request/setting/getPaymentMethods'
import type { GetPlansRequestDTO } from './dto/request/setting/getPlans'
import { CreateCheckoutSessionResponseDTO } from './dto/response/setting/createCheckoutSession'
import { GetPaymentMethodsResponseDTO } from './dto/response/setting/getPaymentMethods'
import { GetPlansResponseDTO } from './dto/response/setting/getPlans'

const MAX_PAYMENT_METHODS = 5

export class SettingService {
  readonly planRepository: IMPlanRepository
  readonly stripe: IStripe
  readonly tStripeCustomerRepository: ITStripeCustomerRepository
  readonly tUserRepository: ITUserRepository
  readonly prisma: PrismaClient

  constructor(
    planRepository: IMPlanRepository,
    stripe: IStripe,
    tStripeCustomerRepository: ITStripeCustomerRepository,
    tUserRepository: ITUserRepository,
    prisma: PrismaClient
  ) {
    this.planRepository = planRepository
    this.stripe = stripe
    this.tStripeCustomerRepository = tStripeCustomerRepository
    this.tUserRepository = tUserRepository
    this.prisma = prisma
  }

  /**
   * プラン一覧取得
   */
  async getPlans(dto: GetPlansRequestDTO): Promise<GetPlansResponseDTO> {
    try {
      const entities = await this.prisma.$transaction(async (tx) => {
        const { authId } = dto

        return await this.planRepository.findAllByAuthId(tx, authId)
      })

      return new GetPlansResponseDTO(entities)
    } catch (error) {
      console.error('Error in SettingService.getPlans:', error)
      throw error
    }
  }

  /**
   * Checkout Session作成
   */
  async createCheckoutSession(
    dto: CreateCheckoutSessionRequestDTO
  ): Promise<CreateCheckoutSessionResponseDTO> {
    try {
      const checkoutUrl = await this.prisma.$transaction(async (tx) => {
        const { authId } = dto

        const aggregation = await this.tStripeCustomerRepository.findByAuthId(tx, authId)
        if (aggregation === null) {
          throw new AppError('ユーザーが見つかりません', 401)
        }

        let stripeCustomer = aggregation.stripeCustomerId
        if (stripeCustomer === null) {
          const stripeCustomerId = await this.stripe.createCustomer(
            aggregation.email,
            aggregation.name
          )

          const createVO = new CreateTStripeCustomerVO(aggregation.userId, stripeCustomerId)
          await this.tStripeCustomerRepository.create(tx, createVO)
          stripeCustomer = stripeCustomerId
        } else {
          const cards = await this.stripe.getPaymentMethods(stripeCustomer)
          if (cards.length >= MAX_PAYMENT_METHODS) {
            throw new AppError(
              `支払い方法の登録上限（${MAX_PAYMENT_METHODS}件）に達しています`,
              400
            )
          }
        }

        const successUrl =
          dto.successUrl ?? `${process.env.FRONTEND_URL}/home/setting/payment/success`
        const cancelUrl = dto.cancelUrl ?? `${process.env.FRONTEND_URL}/home/setting/payment`

        const checkoutUrl = await this.stripe.createCheckoutSession(
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

  /**
   * 支払い方法一覧取得
   */
  async getPaymentMethods(dto: GetPaymentMethodsRequestDTO): Promise<GetPaymentMethodsResponseDTO> {
    try {
      const paymentMethods = await this.prisma.$transaction(async (tx) => {
        const { authId } = dto

        const aggregation = await this.tStripeCustomerRepository.findByAuthId(tx, authId)
        if (aggregation === null) {
          throw new AppError('ユーザーが見つかりません', 401)
        }

        // Stripe Customerが未作成の場合は空配列を返す
        if (aggregation.stripeCustomerId === null) {
          return []
        }

        return await this.stripe.getPaymentMethods(aggregation.stripeCustomerId)
      })

      return new GetPaymentMethodsResponseDTO(paymentMethods)
    } catch (error) {
      console.error('Error in SettingService.getPaymentMethods:', error)
      throw error
    }
  }

  /**
   * プラン変更
   */
  async changePlan(dto: ChangePlanRequestDTO): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const { authId, planId, paymentMethodId } = dto

        // ユーザー、プラン取得
        const user = await this.tUserRepository.findByAuthId(tx, authId)
        if (user === null) {
          throw new AppError('ユーザーが見つかりません', 401)
        }
        if (user.stripeCustomerId === null) {
          throw new AppError('Stripeカスタマーが見つかりません', 400)
        }
        if (user.planId === planId) {
          throw new AppError('すでにこのプランに加入しています', 409)
        }

        const paymentMethods = await this.stripe.getPaymentMethods(user.stripeCustomerId)
        const isExist = paymentMethods.some((pm) => pm.id === paymentMethodId)
        if (!isExist) {
          throw new AppError('支払い方法が見つかりません', 400)
        }

        // 変更先プランの取得
        const targetPlan = await tx.mPlan.findUnique({ where: { id: planId } })
        if (targetPlan === null) {
          throw new AppError('プランが見つかりません', 400)
        }

        // Stripe: デフォルト支払い方法を設定
        await this.stripe.setDefaultPaymentMethod(user.stripeCustomerId, paymentMethodId)

        // Stripe: サブスクリプション操作
        let newSubscriptionId: string | null = user.stripeSubscriptionId
        if (targetPlan.stripePriceId !== null) {
          // 有料プランへの変更
          if (user.stripeSubscriptionId === null) {
            newSubscriptionId = await this.stripe.createSubscription(
              user.stripeCustomerId,
              targetPlan.stripePriceId,
              paymentMethodId
            )
          } else {
            await this.stripe.updateSubscription(
              user.stripeSubscriptionId,
              targetPlan.stripePriceId
            )
          }
        } else {
          // 無料プランへのダウングレード
          if (user.stripeSubscriptionId !== null) {
            await this.stripe.cancelSubscription(user.stripeSubscriptionId)
            newSubscriptionId = null
          }
        }

        // DB 更新
        const updateVO = new UpdateUserVO(user.userId, {
          planId,
          stripeSubscriptionId: newSubscriptionId,
        })
        await this.tUserRepository.update(tx, updateVO)
      })
    } catch (error) {
      console.error('Error in SettingService.changePlan:', error)
      throw error
    }
  }

  /**
   * 支払い方法削除
   */
  async deletePaymentMethod(dto: DeletePaymentMethodRequestDTO): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const { authId, paymentMethodId } = dto

        const aggregation = await this.tStripeCustomerRepository.findByAuthId(tx, authId)
        if (aggregation === null) {
          throw new AppError('ユーザーが見つかりません', 401)
        }
        if (aggregation.stripeCustomerId === null) {
          throw new AppError('Stripeカスタマーが見つかりません', 400)
        }

        const paymentMethods = await this.stripe.getPaymentMethods(aggregation.stripeCustomerId)
        const isExist = paymentMethods.some((pm) => pm.id === paymentMethodId)
        if (!isExist) {
          throw new AppError('支払い方法が見つかりません', 400)
        }

        await this.stripe.detachPaymentMethod(paymentMethodId)
      })
    } catch (error) {
      console.error('Error in SettingService.deletePaymentMethod:', error)
      throw error
    }
  }
}
