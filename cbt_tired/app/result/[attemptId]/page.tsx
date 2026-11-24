import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { ExamCompletionActions } from "@/components/student/ExamCompletionActions"

type Props = {
  params: Promise<{ attemptId: string }>
}

export default async function ResultPage({ params }: Props) {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const { attemptId } = await params
  const id = Number(attemptId)

  if (!Number.isInteger(userId) || !Number.isInteger(id) || id <= 0) {
    notFound()
  }

  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      class: true,
      school: true,
    },
  })

  if (!student) {
    notFound()
  }

  const attempt = await prisma.examAttempt.findFirst({
    where: {
      id,
      studentId: student.id,
      status: {
        in: ["SUBMITTED", "GRADED"],
      },
    },
    include: {
      exam: {
        include: {
          subject: true,
        },
      },
      result: {
        select: {
          id: true,
          generatedAt: true,
        },
      },
    },
  })

  if (!attempt || !attempt.result) {
    notFound()
  }

  const teachers = await prisma.teacherAssignment.findMany({
    where: {
      classId: student.classId,
      subjectId: attempt.exam.subjectId,
    },
    include: {
      teacher: {
        select: {
          name: true,
        },
      },
    },
  })

  const teacherNames = teachers.map((assignment) => assignment.teacher.name)

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl text-green-600">✓</div>

          <h1 className="text-3xl font-bold text-green-600">
            Well done, {student.firstName}!
          </h1>

          <p className="mt-2 text-muted-foreground">
            You have successfully completed your examination. Your answers have
            been submitted and your examination record has been saved.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Student Information</h2>

          <div className="flex justify-between border-b pb-2">
            <span>Full name</span>
            <span className="font-medium">
              {student.firstName} {student.lastName}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Admission number</span>
            <span>{student.admissionNo || "Not available"}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Class</span>
            <span>{student.class.name}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>School</span>
            <span>{student.school.name}</span>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Examination Information</h2>

          <div className="flex justify-between border-b pb-2">
            <span>Examination</span>
            <span className="font-medium">{attempt.exam.title}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Subject</span>
            <span>{attempt.exam.subject.name}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Teacher in charge</span>
            <span className="text-right">
              {teacherNames.length ? teacherNames.join(", ") : "Not assigned"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Date completed</span>
            <span>
              {(
                attempt.submittedAt ?? attempt.result.generatedAt
              ).toLocaleString("en-NG")}
            </span>
          </div>
        </section>

        <div className="mt-8 rounded-lg bg-muted p-4 text-center text-sm">
          Your examination has been recorded successfully. Keep up the good
          work!
        </div>
      </div>

      <ExamCompletionActions />
    </main>
  )
}
