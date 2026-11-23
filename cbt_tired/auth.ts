
import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import type { Role } from "@/lib/generated/prisma/client"

// Extend the Auth.js session and user types.
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      schoolId: number | null
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    schoolId: number | null
  }
}

// Extend the JWT token.
// declare module "next-auth/jwt" {
//   interface JWT {
//     role?: Role
//     schoolId?: number | null
//   }
// }

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        // 1. Validate the submitted credentials.
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string" ||
          !credentials.email.trim() ||
          !credentials.password
        ) {
          return null
        }

        // 2. Find the user by email.
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.trim().toLowerCase(),
          },
        })

        if (!user) {
          return null
        }

        // 3. Compare the supplied password with its stored hash.
        const passwordIsValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!passwordIsValid) {
          return null
        }

        // 4. Return the authenticated user.
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
        }
      },
    }),
  ],

  
callbacks: {
  async jwt({ token, user }) {
    const customToken = token as typeof token & {
      role?: Role
      schoolId?: number | null
    }

    if (user) {
      customToken.role = user.role
      customToken.schoolId = user.schoolId
    }

    return token
  },

  async session({ session, token }) {
    const customToken = token as typeof token & {
      role?: Role
      schoolId?: number | null
    }

    if (session.user) {
      session.user.id = token.sub ?? ""
      session.user.role = customToken.role as Role
      session.user.schoolId = customToken.schoolId ?? null
    }

    return session
  },
},


  pages: {
    signIn: "/login",
  },
})
