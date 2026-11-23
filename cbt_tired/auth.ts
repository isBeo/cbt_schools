
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
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      credentials: {
        email: {},
        schoolCode: {},
        admissionNo: {},
        password: {},
      },

      async authorize(credentials) {
        if (typeof credentials.password !== "string") return null

        let user = null

        // Staff login
        if (typeof credentials.email === "string" && credentials.email.trim()) {
          user = await prisma.user.findUnique({
            where: {
              email: credentials.email.trim().toLowerCase(),
            },
          })

          if (!user || user.role === "STUDENT") return null
        }

        // Student login
        else if (
          typeof credentials.schoolCode === "string" &&
          typeof credentials.admissionNo === "string"
        ) {
          const school = await prisma.school.findUnique({
            where: {
              code: credentials.schoolCode.trim().toUpperCase(),
            },
          })

          if (!school) return null

          const student = await prisma.student.findFirst({
            where: {
              schoolId: school.id,
              admissionNo: credentials.admissionNo.trim(),
            },
            include: { user: true },
          })

          if (!student) return null
          user = student.user
        } else {
          return null
        }

       if (!user) return null

const valid = await bcrypt.compare(
  credentials.password,
  user.passwordHash
)

if (!valid) return null

return {
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: user.role,
  schoolId: user.schoolId,
}

        if (!valid) return null

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
      if (user) {
        token.role = user.role
        token.schoolId = user.schoolId
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.role = token.role as Role
        session.user.schoolId = (token.schoolId as number | null) ?? null
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
})
