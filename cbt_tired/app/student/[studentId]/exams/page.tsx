import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

type Props = {
  params: Promise<{
    studentId: string
  }>
}

export default async function StudentExamsPage({ params }: Props) {
  const { studentId } = await params

  const student = await prisma.student.findUnique({
    where: {
      id: Number(studentId),
    },
  })

  if (!student) {
    notFound()
  }

  const exams = await prisma.exam.findMany({
    where: {
      classId: student.classId,
      status: "ACTIVE",
    },
    include: {
      subject: true,
    },
  })

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Welcome back, {student.firstName}</h1>

      <p className="mb-6 text-muted-foreground">Available Exams</p>

      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam.id} className="rounded-lg border p-4">
            <h2 className="font-semibold">{exam.title}</h2>

            <p>{exam.subject.name}</p>

            <p>{exam.durationMinutes} Minutes</p>

            <Link
              href={`/exam/${exam.id}?student=${student.id}`}
              className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white"
            >
              Start Exam
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}
