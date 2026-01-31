import { createClerkClient, verifyToken } from '@clerk/backend'
import type { PrismaClient } from '@prisma/client'
import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { MASTER } from './lib/master'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export function createMiddleware(prisma: PrismaClient) {
  return async function middleware(c: Context, next: Next) {
    const path = c.req.path
    if (path === '/doc' || path === '/reference') {
      await next()
      return
    }

    const authHeader = c.req.header('Authorization')
    if (authHeader === undefined) {
      throw new HTTPException(401, { message: '認証が必要です' })
    }
    const token = authHeader.replace('Bearer ', '')

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      })
      const authId = payload.sub

      // トランザクションでユーザー存在確認とinsert
      await prisma.$transaction(async (tx) => {
        const userCount = await tx.tUser.count({
          where: { authId },
        })

        if (userCount === 0) {
          // Clerkからユーザー情報を取得
          const clerkUser = await clerkClient.users.getUser(authId)
          const email =
            clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
              ?.emailAddress || ''
          const name =
            clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.lastName} ${clerkUser.firstName}`
              : clerkUser.username || email || 'Unknown User'

          await tx.tUser.create({
            data: {
              authId,
              name,
              email,
              imageUrl: clerkUser.imageUrl,
              planId: MASTER.getPlanId(MASTER.PLAN.FREE),
            },
          })
        }
      })

      c.set('authId', authId)
      await next()
    } catch (error) {
      console.error('Middleware error:', error)
      throw new HTTPException(401, { message: '認証に失敗しました' })
    }
  }
}
