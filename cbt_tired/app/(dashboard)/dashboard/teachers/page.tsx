
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

import CreateTeacher from "./components/create_teacher"
import TeachersTable from "./components/teachers_table"

export default async function TeachersPage() {
  const session = await auth()

  if (
    !session?.user ||
    session.user.role !== "SCHOOL_ADMIN" ||
    !session.user.schoolId
  ) {
    redirect("/dashboard")
  }

  const teachers = await prisma.user.findMany({
    where: {
      schoolId: session.user.schoolId,
      role: "TEACHER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher Management</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage teacher accounts for your school.
        </p>
      </div>

      <CreateTeacher />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Registered Teachers</h2>
          <p className="text-sm text-muted-foreground">
            {teachers.length} teacher{teachers.length === 1 ? "" : "s"} registered
          </p>
        </div>

        <TeachersTable teachers={teachers} />
      </section>
    </div>
  )
}
