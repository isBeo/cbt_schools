import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function StudentPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login")
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: Number(session.user.id),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      class: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!student) {
    redirect("/login")
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {student.firstName}</h1>
        <p className="text-muted-foreground">
          {student.firstName} {student.lastName} · {student.class.name}
        </p>
      </div>

      <div className="rounded-lg border p-5">
        <h2 className="font-semibold">Your Examinations</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          View examinations assigned to your class.
        </p>
        <Link
          href="/student/exams"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white"
        >
          View Available Exams
        </Link>
      </div>

      <div className="rounded-lg border p-5">
        <h2 className="font-semibold">Your Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          View your student dashboard.
        </p>
        <Link
          href={`/student/${student.id}`}
          className="mt-4 inline-block rounded border px-4 py-2"
        >
          View Profile
        </Link>
      </div>
    </main>
  )
}
