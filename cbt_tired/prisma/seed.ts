import "dotenv/config"
import bcrypt from "bcryptjs"

import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is missing.")
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

async function main() {
  const name = process.env.SUPER_ADMIN_NAME
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SUPER_ADMIN_PASSWORD

  if (!name || !email || !password) {
    throw new Error(
      "Set SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD."
    )
  }

  if (password.length < 12) {
    throw new Error("Administrator password must be at least 12 characters.")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log("An account with this email already exists.")
    console.log("No account changes were made.")
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      schoolId: null,
    },
  })

  console.log("SUPER_ADMIN account created successfully.")
  console.log(`Email: ${email}`)
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
