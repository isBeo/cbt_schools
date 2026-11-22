import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import type { Role } from "@/lib/generated/prisma/client"

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        schoolCode: {},
        admissionNo: {},
        password: {},
      },

      async authorize(credentials) {
        if (typeof credentials.password !== "string" || !credentials.password) {
          return null
        }

        let user = null

        // Staff login: email + password.
        if (typeof credentials.email === "string" && credentials.email.trim()) {
          user = await prisma.user.findUnique({
            where: {
              email: credentials.email.trim().toLowerCase(),
            },
          })

          // Students must use school code and admission number.
          if (!user || user.role === "STUDENT") {
            return null
          }
        }

        // Student login: school code + admission number + password.
        else if (
          typeof credentials.schoolCode === "string" &&
          typeof credentials.admissionNo === "string" &&
          credentials.schoolCode.trim() &&
          credentials.admissionNo.trim()
        ) {
          const school = await prisma.school.findFirst({
            where: {
              code: {
                equals: credentials.schoolCode.trim(),
                mode: "insensitive",
              },
            },
            select: {
              id: true,
            },
          })

          if (!school) {
            return null
          }

          const student = await prisma.student.findFirst({
            where: {
              schoolId: school.id,
              admissionNo: credentials.admissionNo.trim(),
            },
            include: {
              user: true,
            },
          })

          if (!student?.user || student.user.role !== "STUDENT") {
            return null
          }

          user = student.user
        } else {
          return null
        }

        const passwordIsValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!passwordIsValid) {
          return null
        }

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
