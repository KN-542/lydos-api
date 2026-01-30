import { verifyToken } from '@clerk/backend'
import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

export async function middleware(c: Context, next: Next) {
  const path = c.req.path

  if (path === '/doc' || path === '/reference') {
    await next()
    return
  }

  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    throw new HTTPException(401, { message: '認証が必要です' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    c.set('userId', payload.sub)
    await next()
  } catch {
    throw new HTTPException(401, { message: '認証に失敗しました' })
  }
}
