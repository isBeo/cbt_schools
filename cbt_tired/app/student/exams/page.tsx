import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function StudentExamsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login")
  }

  const student = await prisma.student.findUnique({
    where: { userId: Number(session.user.id) },
    select: {
      id: true,
      classId: true,
      firstName: true,
    },
  })

  if (!student) redirect("/login")

  const now = new Date()

  const exams = await prisma.exam.findMany({
    where: {
      classId: student.classId,
      status: "ACTIVE",
      AND: [
        {
          OR: [{ startTime: null }, { startTime: { lte: now } }],
        },
        {
          OR: [{ endTime: null }, { endTime: { gte: now } }],
        },
      ],
      attempts: {
        none: {
          studentId: student.id,
          status: {
            in: ["SUBMITTED", "GRADED"],
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      durationMinutes: true,
      subject: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  })

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Welcome, {student.firstName}</h1>

      <h2 className="font-semibold">Available Examinations</h2>

      {exams.length === 0 && <p>No examinations are available.</p>}

      {exams.map((exam) => (
        <div key={exam.id} className="rounded-lg border p-4">
          <h3 className="font-semibold">{exam.title}</h3>
          <p>{exam.subject.name}</p>
          <p>{exam.durationMinutes} minutes</p>

          <Link
            href={`/exam/${exam.id}`}
            className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-white"
          >
            Start Exam
          </Link>
        </div>
      ))}
    </main>
  )
}
