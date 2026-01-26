import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null
    }
    return Math.min(times * 50, 2000)
  },
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (err: Error) => {
  console.error('❌ Redis error:', err)
})

export { redis }
