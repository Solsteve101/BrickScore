import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { findUserByEmail, upsertGoogleUser } from './users-store'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'E-Mail / Passwort',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(creds) {
        const email = typeof creds?.email === 'string' ? creds.email : ''
        const password = typeof creds?.password === 'string' ? creds.password : ''
        if (!email || !password) return null
        const user = await findUserByEmail(email)
        if (!user || !user.passwordHash) return null
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
          image: user.image ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user?.email) {
        const dbUser = await upsertGoogleUser({
          email: user.email,
          name: user.name ?? profile?.name ?? null,
          image: user.image ?? (typeof profile?.picture === 'string' ? profile.picture : null),
        })
        // Replace Google's `sub` with the Prisma cuid so the JWT carries the
        // canonical user id — every downstream findUserById lookup matches.
        user.id = dbUser.id
      }
      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = (user as { id?: string }).id ?? token.sub ?? token.id
        token.provider = account?.provider === 'google' ? 'google' : 'credentials'
        const u = user as { image?: string | null }
        // Only stash short URLs (e.g. Google CDN) in the JWT — never a
        // base64 data URL. Cookies have a ~4 KB practical limit and an
        // uploaded avatar is 50–200 KB, which would trigger HTTP 431 on
        // every subsequent request. Uploaded avatars are fetched on demand
        // via /api/user/avatar.
        if (u.image !== undefined) {
          token.picture = u.image && !u.image.startsWith('data:') ? u.image : undefined
        }
      }
      if (trigger === 'update' && session && typeof session === 'object') {
        const next = session as { name?: string; image?: string | null }
        if (typeof next.name === 'string') token.name = next.name
        if ('image' in next) {
          token.picture = next.image && !next.image.startsWith('data:') ? next.image : undefined
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? ''
        session.user.provider = (token.provider as 'credentials' | 'google' | undefined) ?? 'credentials'
        if (typeof token.name === 'string') session.user.name = token.name
        const pic = token.picture as string | undefined
        session.user.image = pic && !pic.startsWith('data:') ? pic : null
      }
      return session
    },
  },
})
