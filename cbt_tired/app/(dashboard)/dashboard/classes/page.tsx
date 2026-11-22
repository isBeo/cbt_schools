import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CreateClass } from "./components/create_class"
import { ClassTable } from "./components/class_table"

export default async function ClassesPage() {
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
          Only an authorised school administrator can manage classes.
        </p>
      </div>
    )
  }

  const classes = await prisma.class.findMany({
    where: {
      schoolId: session.user.schoolId,
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Class Management</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage your school's Nursery, Primary and Secondary
          classes.
        </p>
      </div>

      <CreateClass />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">School Classes</h2>
          <p className="text-sm text-muted-foreground">
            {classes.length} {classes.length === 1 ? "class" : "classes"}{" "}
            registered
          </p>
        </div>

        <ClassTable classes={classes} />
      </section>
    </div>
  )
}
