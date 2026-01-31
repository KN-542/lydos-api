import Stripe from 'stripe'

if (process.env.STRIPE_SECRET_KEY === undefined) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

/**
 * @package
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
})
