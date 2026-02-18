import { describe, expect, it, mock } from 'bun:test'
import { MPlanEntity } from '../domain/model/mPlan'
import { TStripeCustomerAggregation } from '../domain/model/tStripeCustomer'
import { TUserAggregation } from '../domain/model/tUser'
import { AppError } from '../lib/error'
import { ChangePlanRequestDTO } from './dto/request/setting/changePlan'
import { CreateCheckoutSessionRequestDTO } from './dto/request/setting/createCheckoutSession'
import { DeletePaymentMethodRequestDTO } from './dto/request/setting/deletePaymentMethod'
import { GetPaymentMethodsRequestDTO } from './dto/request/setting/getPaymentMethods'
import { GetPlansRequestDTO } from './dto/request/setting/getPlans'
import { SettingService } from './setting'

// prisma.$transaction はコールバックをそのまま実行して結果を返す
const mockTx = {} as never
const mockPrisma = {
  $transaction: (fn: (tx: never) => unknown) => fn(mockTx),
} as never

// Stripe スタブ（テスト対象のケースでは呼ばれない）
const noopStripe = {
  createCustomer: mock(() => Promise.resolve('cus_new')),
  createCheckoutSession: mock(() => Promise.resolve('https://checkout.stripe.com/pay/test')),
  getPaymentMethods: mock(() => Promise.resolve([])),
  detachPaymentMethod: mock(() => Promise.resolve()),
  setDefaultPaymentMethod: mock(() => Promise.resolve()),
  createSubscription: mock(() => Promise.resolve('sub_new')),
  updateSubscription: mock(() => Promise.resolve()),
  cancelSubscription: mock(() => Promise.resolve()),
}

// --- テスト用データ生成ヘルパー ---

const makePlanEntity = (id = 1, isSelected = false) =>
  new MPlanEntity(id, 'Free Plan', '無料プランです', 0, isSelected)

const makeStripeAgg = (stripeCustomerId: string | null = null) =>
  new TStripeCustomerAggregation(1, 'test@example.com', 'Test User', stripeCustomerId)

const makeUser = (planId = 1, stripeCustomerId: string | null = null) =>
  new TUserAggregation(
    1,
    'auth-1',
    'Test User',
    'test@example.com',
    null,
    planId,
    stripeCustomerId,
    null,
    null,
    new Date(),
    new Date()
  )

// --- サービスファクトリ ---

type Repos = {
  findAllPlans?: () => Promise<MPlanEntity[]>
  findStripeCustomer?: () => Promise<TStripeCustomerAggregation | null>
  findUser?: () => Promise<TUserAggregation | null>
}

const makeService = (repos: Repos = {}) =>
  new SettingService(
    {
      findAllByAuthId: mock(repos.findAllPlans ?? (() => Promise.resolve([]))),
    },
    noopStripe,
    {
      findByAuthId: mock(repos.findStripeCustomer ?? (() => Promise.resolve(null))),
      create: mock(() => Promise.resolve()),
    },
    {
      findByAuthId: mock(repos.findUser ?? (() => Promise.resolve(null))),
      update: mock(() => Promise.resolve()),
    },
    mockPrisma
  )

// =====================================================================

describe('SettingService.getPlans', () => {
  it('プラン一覧を GetPlansResponseDTO として返す', async () => {
    const entities = [makePlanEntity(1, true), makePlanEntity(2, false)]
    const service = makeService({ findAllPlans: () => Promise.resolve(entities) })

    const result = await service.getPlans(new GetPlansRequestDTO('auth-1'))

    expect(result.plans).toHaveLength(2)
    expect(result.plans[0].id).toBe(1)
    expect(result.plans[0].isSelected).toBe(true)
    expect(result.plans[1].id).toBe(2)
    expect(result.plans[1].isSelected).toBe(false)
  })

  it('プランが存在しない場合は空配列を返す', async () => {
    const service = makeService({ findAllPlans: () => Promise.resolve([]) })

    const result = await service.getPlans(new GetPlansRequestDTO('auth-1'))

    expect(result.plans).toEqual([])
  })

  it('repository が throw した場合はそのまま再スローする', async () => {
    const service = makeService({ findAllPlans: () => Promise.reject(new Error('DB error')) })

    const error = await service.getPlans(new GetPlansRequestDTO('auth-1')).catch((e) => e)

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('DB error')
  })
})

// =====================================================================

describe('SettingService.getPaymentMethods', () => {
  it('ユーザーが見つからない場合は AppError(401) を投げる', async () => {
    const service = makeService({ findStripeCustomer: () => Promise.resolve(null) })

    const error = await service
      .getPaymentMethods(new GetPaymentMethodsRequestDTO('auth-1'))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(401)
  })

  it('Stripe 顧客未作成の場合は空配列を返す', async () => {
    const service = makeService({
      findStripeCustomer: () => Promise.resolve(makeStripeAgg(null)),
    })

    const result = await service.getPaymentMethods(new GetPaymentMethodsRequestDTO('auth-1'))

    expect(result.paymentMethods).toEqual([])
  })
})

// =====================================================================

describe('SettingService.createCheckoutSession', () => {
  it('ユーザーが見つからない場合は AppError(401) を投げる', async () => {
    const service = makeService({ findStripeCustomer: () => Promise.resolve(null) })

    const error = await service
      .createCheckoutSession(new CreateCheckoutSessionRequestDTO('auth-1'))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(401)
  })
})

// =====================================================================

describe('SettingService.changePlan', () => {
  it('ユーザーが見つからない場合は AppError(401) を投げる', async () => {
    const service = makeService({ findUser: () => Promise.resolve(null) })

    const error = await service
      .changePlan(new ChangePlanRequestDTO('auth-1', 2, 'pm_test'))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(401)
  })

  it('Stripe 顧客が未作成の場合は AppError(400) を投げる', async () => {
    const service = makeService({
      findUser: () => Promise.resolve(makeUser(1, null)),
    })

    const error = await service
      .changePlan(new ChangePlanRequestDTO('auth-1', 2, 'pm_test'))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(400)
  })

  it('現在と同じプランに変更しようとした場合は AppError(409) を投げる', async () => {
    const service = makeService({
      findUser: () => Promise.resolve(makeUser(2, 'cus_existing')),
    })

    const error = await service
      .changePlan(new ChangePlanRequestDTO('auth-1', 2, 'pm_test'))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(409)
  })
})

// =====================================================================

describe('SettingService.deletePaymentMethod', () => {
  it('ユーザーが見つからない場合は AppError(401) を投げる', async () => {
    const service = makeService({ findStripeCustomer: () => Promise.resolve(null) })

    const error = await service
      .deletePaymentMethod(new DeletePaymentMethodRequestDTO('auth-1', 'pm_test'))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(401)
  })

  it('Stripe 顧客が未作成の場合は AppError(400) を投げる', async () => {
    const service = makeService({
      findStripeCustomer: () => Promise.resolve(makeStripeAgg(null)),
    })

    const error = await service
      .deletePaymentMethod(new DeletePaymentMethodRequestDTO('auth-1', 'pm_test'))
      .catch((e) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).statusCode).toBe(400)
  })
})
