import { describe, expect, it, mock } from 'bun:test'
import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

// Clerk モック（middleware.ts がモジュールロード時に createClerkClient を呼ぶため mock.module を先に宣言）
const mockVerifyToken = mock(() => Promise.resolve({ sub: 'user_123' }))
const mockGetUser = mock(() =>
  Promise.resolve({
    emailAddresses: [{ id: 'email_1', emailAddress: 'test@example.com' }],
    primaryEmailAddressId: 'email_1',
    firstName: '太郎',
    lastName: '山田',
    username: null,
    imageUrl: 'https://example.com/image.png',
  })
)
mock.module('@clerk/backend', () => ({
  verifyToken: mockVerifyToken,
  createClerkClient: () => ({ users: { getUser: mockGetUser } }),
}))

import { createMiddleware } from './middleware'

// --- ヘルパー ---

const makeCtx = (path: string, authHeader?: string) => {
  const setMock = mock((_key: string, _value: string) => {})
  const ctx = {
    req: {
      path,
      header: (name: string) => (name === 'Authorization' ? authHeader : undefined),
    },
    set: setMock,
  } as unknown as Context
  return { ctx, setMock }
}

const nextFn: Next = mock(() => Promise.resolve())

const makePrisma = (userCount = 1) =>
  ({
    $transaction: async (fn: (tx: never) => unknown) =>
      fn({
        tUser: {
          count: () => Promise.resolve(userCount),
          create: mock(() => Promise.resolve({})),
        },
      } as never),
  }) as never

// =====================================================================

describe('createMiddleware', () => {
  it('/doc へのリクエストは認証をスキップして next を呼ぶ', async () => {
    const { ctx } = makeCtx('/doc')
    const next = mock(() => Promise.resolve())
    const middleware = createMiddleware(makePrisma())

    await middleware(ctx, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  it('/reference へのリクエストは認証をスキップして next を呼ぶ', async () => {
    const { ctx } = makeCtx('/reference')
    const next = mock(() => Promise.resolve())
    const middleware = createMiddleware(makePrisma())

    await middleware(ctx, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  it('Authorization ヘッダーがない場合は HTTPException(401) を投げる', async () => {
    const { ctx } = makeCtx('/api/chat')
    const middleware = createMiddleware(makePrisma())

    const error = await middleware(ctx, nextFn).catch((e) => e)

    expect(error).toBeInstanceOf(HTTPException)
    expect((error as HTTPException).status).toBe(401)
  })

  it('トークン検証が失敗した場合は HTTPException(401) を投げる', async () => {
    mockVerifyToken.mockImplementationOnce(() => Promise.reject(new Error('invalid token')))
    const { ctx } = makeCtx('/api/chat', 'Bearer invalid_token')
    const middleware = createMiddleware(makePrisma())

    const error = await middleware(ctx, nextFn).catch((e) => e)

    expect(error).toBeInstanceOf(HTTPException)
    expect((error as HTTPException).status).toBe(401)
  })

  it('有効なトークンで既存ユーザーの場合は authId をセットして next を呼ぶ', async () => {
    mockVerifyToken.mockImplementationOnce(() => Promise.resolve({ sub: 'user_123' }))
    const { ctx, setMock } = makeCtx('/api/chat', 'Bearer valid_token')
    const next = mock(() => Promise.resolve())
    const middleware = createMiddleware(makePrisma(1))

    await middleware(ctx, next)

    expect(setMock).toHaveBeenCalledWith('authId', 'user_123')
    expect(next).toHaveBeenCalledTimes(1)
  })

  // 新規ユーザー作成パス (userCount === 0) のテストは省略。
  // createClerkClient がモジュールスコープで評価されるため mock.module が clerkClient.users.getUser
  // まで届かず、実際の Clerk API が呼ばれてしまうため単体テストで担保できない。
})
