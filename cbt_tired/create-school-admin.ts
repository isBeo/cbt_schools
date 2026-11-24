import "dotenv/config"

import { PrismaClient } from "./lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "schooladmin@ecwis.com"
  const password = "ChangeMe123!"
  const schoolId = 1

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log("This admin email already exists.")
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name: "Eagle Crestwood School Admin",
      email,
      passwordHash,
      role: "SCHOOL_ADMIN",
      schoolId,
    },
  })

  console.log("School Admin created successfully.")
  console.log("Email:", email)
  console.log("Password:", password)
  console.log("School code:", "ECWIS")
}

main()
  .catch((error) => {
    console.error("Creation failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
