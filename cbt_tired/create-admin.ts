
import "dotenv/config"

import { PrismaClient } from "./lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DIRECT_URL

if (!connectionString) {
  throw new Error("DIRECT_URL is missing from .env")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "theo@tech.com"
  const password = "ChangeMe123!"

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log("Admin already exists.")
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      schoolId: null,
    },
  })

  console.log("Super Admin created successfully.")
  console.log("Email:", email)
  console.log("Password:", password)
}

main()
  .catch((error) => {
    console.error("Admin creation failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
