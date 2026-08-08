import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import type { PlanType, Role } from '@/lib/generated/prisma/client';
import bcrypt from 'bcryptjs';

const DEFAULT_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/** Session lifetime in seconds, overridable via SESSION_MAX_AGE. */
const sessionMaxAge = Number(process.env.SESSION_MAX_AGE) || DEFAULT_SESSION_MAX_AGE;

/**
 * Verifies an email/password pair against the stored bcrypt hash.
 *
 * Returns null for every failure mode — unknown email, an account with no
 * password (OAuth-only), and a wrong password are indistinguishable to the
 * caller, so the response cannot be used to enumerate registered accounts.
 */
export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Returning null is the documented signal for a failed sign-in.
        return verifyCredentials(
          credentials.email as string,
          credentials.password as string,
        );
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }

      if (trigger === 'update' || user) {
        const updatedUser: {
          name: string | null;
          email: string;
          role: Role;
          subscription: {
            planType: PlanType;
            isActive: boolean;
            endDate: Date | null;
          } | null;
        } | null = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            name: true,
            email: true,
            role: true,
            subscription: {
              select: { planType: true, isActive: true, endDate: true },
            },
          },
        });
        if (updatedUser) {
          token.name = updatedUser.name;
          token.email = updatedUser.email;
          token.role = updatedUser.role;
          token.subscription = updatedUser.subscription;
        }
      }
      return token;
    },

    /// for session
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id;
        if (token.email) session.user.email = token.email;
        session.user.role = token.role;
        session.user.subscription = token.subscription;
        session.user.name = token.name ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: sessionMaxAge,
  },
});
