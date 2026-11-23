
import "dotenv/config"

import { PrismaClient } from "./lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const schools = await prisma.school.findMany()
  console.log(schools)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
