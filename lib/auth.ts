import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { sql } from './db'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const users = await sql`
          SELECT id, email, password_hash, subscription_tier, stripe_customer_id
          FROM cg_users
          WHERE email = ${email}
          LIMIT 1
        `

        if (!users.length) return null

        const user = users[0] as {
          id: string
          email: string
          password_hash: string
          subscription_tier: string
          stripe_customer_id: string | null
        }
        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          subscriptionTier: user.subscription_tier,
          stripeCustomerId: user.stripe_customer_id ?? undefined,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.subscriptionTier = (user as { subscriptionTier?: string }).subscriptionTier
        token.stripeCustomerId = (user as { stripeCustomerId?: string }).stripeCustomerId
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.subscriptionTier = token.subscriptionTier as string
        session.user.stripeCustomerId = token.stripeCustomerId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})
