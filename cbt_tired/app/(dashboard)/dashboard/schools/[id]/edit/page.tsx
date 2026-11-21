
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SchoolCodeForm } from "@/components/forms/SchoolCodeForm"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditSchoolPage({ params }: Props) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  const { id } = await params
  const schoolId = Number(id)

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    notFound()
  }

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
    },
  })

  if (!school) {
    notFound()
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Configure School</h1>
        <p className="text-sm text-muted-foreground">
          Update the school's identification code.
        </p>
      </div>

      <SchoolCodeForm
        schoolId={school.id}
        schoolName={school.name}
        currentCode={school.code}
      />
    </main>
  )
}
