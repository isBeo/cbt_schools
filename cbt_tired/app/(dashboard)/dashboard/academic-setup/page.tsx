import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AcademicSetupClient } from "./components/academic_setup_client"

export default async function AcademicSetupPage() {
  const session = await auth()

  if (
    !session?.user ||
    session.user.role !== "SCHOOL_ADMIN" ||
    !session.user.schoolId
  ) {
    return (
      <div className="rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Academic Setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is available to School Administrators. A school must be
          assigned to your account before you can manage academic sessions.
        </p>
      </div>
    )
  }

  const sessions = await prisma.academicSession.findMany({
    where: {
      schoolId: session.user.schoolId,
    },
    include: {
      terms: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      name: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academic Setup</h1>
        <p className="text-sm text-muted-foreground">
          Manage your school's academic sessions and terms.
        </p>
      </div>

      <AcademicSetupClient sessions={sessions} />
    </div>
  )
}
