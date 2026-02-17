import type { PrismaClient } from '@prisma/client'
import type { IMPlanRepository } from '../domain/interface/mPlan'
import type { IStripe } from '../domain/interface/stripe'
import type { ITStripeCustomerRepository } from '../domain/interface/tStripeCustomer'
import type { ITUserRepository } from '../domain/interface/tUser'
import { CreateTStripeCustomerVO } from '../domain/model/tStripeCustomer'
import { TUserPlanChangeVO, UpdateUserPlanVO } from '../domain/model/tUser'
import { AppError } from '../lib/error'
import type { ChangePlanRequestDTO } from './dto/request/setting/changePlan'
import type { CreateCheckoutSessionRequestDTO } from './dto/request/setting/createCheckoutSession'
import type { DeletePaymentMethodRequestDTO } from './dto/request/setting/deletePaymentMethod'
import type { GetPaymentMethodsRequestDTO } from './dto/request/setting/getPaymentMethods'
import type { GetPlansRequestDTO } from './dto/request/setting/getPlans'
import { ChangePlanResponseDTO } from './dto/response/setting/changePlan'
import { CreateCheckoutSessionResponseDTO } from './dto/response/setting/createCheckoutSession'
import { DeletePaymentMethodResponseDTO } from './dto/response/setting/deletePaymentMethod'
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

  async changePlan(dto: ChangePlanRequestDTO): Promise<ChangePlanResponseDTO> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const { authId, planId, paymentMethodId } = dto
        const vo = new TUserPlanChangeVO(authId)

        const userAgg = await this.tUserRepository.findForPlanChange(tx, vo)
        if (userAgg === null) {
          throw new AppError('ユーザーが見つかりません', 401)
        }
        if (userAgg.currentPlanId === planId) {
          throw new AppError('すでにこのプランに加入しています', 400)
        }
        if (userAgg.stripeCustomerId === null) {
          throw new AppError('Stripeカスタマーが見つかりません', 400)
        }

        // 支払い方法の所有権確認
        const paymentMethods = await this.stripe.getPaymentMethods(userAgg.stripeCustomerId)
        const owns = paymentMethods.some((pm) => pm.id === paymentMethodId)
        if (!owns) {
          throw new AppError('支払い方法が見つかりません', 400)
        }

        // 変更先プランの取得
        const targetPlan = await tx.mPlan.findUnique({ where: { id: planId } })
        if (targetPlan === null) {
          throw new AppError('プランが見つかりません', 400)
        }

        // Stripe: デフォルト支払い方法を設定
        await this.stripe.setDefaultPaymentMethod(userAgg.stripeCustomerId, paymentMethodId)

        // Stripe: サブスクリプション操作
        let newSubscriptionId: string | null = userAgg.stripeSubscriptionId

        if (targetPlan.stripePriceId !== null) {
          // 有料プランへの変更
          if (userAgg.stripeSubscriptionId === null) {
            newSubscriptionId = await this.stripe.createSubscription(
              userAgg.stripeCustomerId,
              targetPlan.stripePriceId,
              paymentMethodId
            )
          } else {
            await this.stripe.updateSubscription(
              userAgg.stripeSubscriptionId,
              targetPlan.stripePriceId
            )
          }
        } else {
          // 無料プランへのダウングレード
          if (userAgg.stripeSubscriptionId !== null) {
            await this.stripe.cancelSubscription(userAgg.stripeSubscriptionId)
            newSubscriptionId = null
          }
        }

        // DB 更新
        const updateVO = new UpdateUserPlanVO(
          userAgg.userId,
          planId,
          newSubscriptionId,
          userAgg.stripeCustomerInternalId,
          paymentMethodId
        )
        await this.tUserRepository.updatePlan(tx, updateVO)
      })

      return new ChangePlanResponseDTO()
    } catch (error) {
      console.error('Error in SettingService.changePlan:', error)
      throw error
    }
  }

  async deletePaymentMethod(
    dto: DeletePaymentMethodRequestDTO
  ): Promise<DeletePaymentMethodResponseDTO> {
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

        // 所有権の確認: 該当ユーザーのCustomerに紐づくPayment Methodか検証
        const paymentMethods = await this.stripe.getPaymentMethods(aggregation.stripeCustomerId)
        const owns = paymentMethods.some((pm) => pm.id === paymentMethodId)
        if (!owns) {
          throw new AppError('支払い方法が見つかりません', 400)
        }

        await this.stripe.detachPaymentMethod(paymentMethodId)
      })

      return new DeletePaymentMethodResponseDTO()
    } catch (error) {
      console.error('Error in SettingService.deletePaymentMethod:', error)
      throw error
    }
  }
}
