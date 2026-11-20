
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CreateAssignment } from "./components/create_assignment"
import { AssignmentsTable } from "./components/assignments_table"

export default async function TeacherAssignmentsPage() {
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
          Only an authorised school administrator can manage teacher assignments.
        </p>
      </div>
    )
  }

  const schoolId = session.user.schoolId

  const [teachers, classes, subjects, assignments] = await Promise.all([
    prisma.user.findMany({
      where: {
        schoolId,
        role: "TEACHER",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.class.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        level: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.subject.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.teacherAssignment.findMany({
      where: {
        teacher: { schoolId },
        class: { schoolId },
        subject: { schoolId },
      },
      include: {
        teacher: {
          select: {
            name: true,
            email: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher Assignments</h1>
        <p className="text-sm text-muted-foreground">
          Assign teachers to the subjects they teach in each class.
        </p>
      </div>

      <CreateAssignment
        teachers={teachers}
        classes={classes}
        subjects={subjects}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Current Assignments</h2>
          <p className="text-sm text-muted-foreground">
            {assignments.length}{" "}
            {assignments.length === 1 ? "assignment" : "assignments"} registered
          </p>
        </div>

        <AssignmentsTable assignments={assignments} />
      </section>
    </div>
  )
}
