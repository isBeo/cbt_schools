
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CreateSubject } from "./components/create_subject"
import { SubjectsTable } from "./components/subjects_table"

export default async function SubjectsPage() {
  const session = await auth()

  if (
    !session?.user ||
    session.user.role !== "SCHOOL_ADMIN" ||
    !session.user.schoolId
  ) {
    return (
      <div className="rounded-lg border p-6">
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only an authorised school administrator can manage subjects.
        </p>
      </div>
    )
  }

  const subjects = await prisma.subject.findMany({
    where: {
      schoolId: session.user.schoolId,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subject Management</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage subjects taught in your school.
        </p>
      </div>

      <CreateSubject />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">School Subjects</h2>
          <p className="text-sm text-muted-foreground">
            {subjects.length}{" "}
            {subjects.length === 1 ? "subject" : "subjects"} registered
          </p>
        </div>

        <SubjectsTable subjects={subjects} />
      </section>
    </div>
  )
}
