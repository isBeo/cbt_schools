import { RegisterForm } from "@/components/forms/StudentRegForm"
import { prisma } from "@/lib/prisma"

export default async function RegisterPage() {
  const classes = await prisma.class.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Student Registration</h1>

      <RegisterForm classes={classes} />
    </main>
  )
}
