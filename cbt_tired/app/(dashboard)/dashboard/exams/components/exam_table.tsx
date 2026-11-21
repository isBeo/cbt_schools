import DeleteExam from "./delete_exam"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

import {
  activateExam,
  closeExam,
  draftExam,
  importExamQuestions,
  publishExam,
} from "@/app/actions/exam"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import Link from "next/link"

export default async function ExamTable() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id, role, schoolId } = session.user

  let where = {}

  if (role === "SUPER_ADMIN") {
    // Super Admin can see every school's exams.
  } else if (role === "SCHOOL_ADMIN") {
    if (!schoolId) {
      redirect("/dashboard")
    }

    where = {
      class: {
        is: {
          schoolId,
        },
      },
    }
  } else if (role === "TEACHER") {
    const teacherId = Number(id)

    if (!Number.isInteger(teacherId)) {
      redirect("/dashboard")
    }

    const assignments = await prisma.teacherAssignment.findMany({
      where: { teacherId },
      select: {
        classId: true,
        subjectId: true,
      },
    })

    where = {
      OR: assignments.map((assignment) => ({
        classId: assignment.classId,
        subjectId: assignment.subjectId,
      })),
    }
  } else {
    redirect("/dashboard")
  }

  const exams = await prisma.exam.findMany({
    where,
    include: {
      subject: true,
      class: true,
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[320px]">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {exams.map((exam) => (
          <TableRow key={exam.id}>
            <TableCell className="font-medium">
              {exam.title}
            </TableCell>

            <TableCell>{exam.subject.name}</TableCell>

            <TableCell>{exam.class.name}</TableCell>

            <TableCell>
              <Badge variant="secondary">{exam.status}</Badge>
            </TableCell>

            <TableCell>
              <div className="flex flex-wrap gap-2">

{exam.status === "DRAFT" && (
  <>
    <Link href={`/dashboard/exams/${exam.id}/questions`}>
      <Button size="sm" variant="secondary">
        Manage Questions
      </Button>
    </Link>

    <form action={publishExam.bind(null, exam.id)}>
      <Button size="sm">
        Publish
      </Button>
    </form>

    {(role === "SUPER_ADMIN" || role === "SCHOOL_ADMIN") && (
      <DeleteExam
        examId={exam.id}
        examTitle={exam.title}
      />
    )}
  </>
)}

                {exam.status === "PUBLISHED" && (
                  <>
                    {exam._count.questions === 0 ? (
                      <form action={importExamQuestions.bind(null, exam.id)}>
                        <Button size="sm" variant="secondary">
                          Import Questions
                        </Button>
                      </form>
                    ) : (
                      <Badge variant="default">
                        {exam._count.questions} Questions Imported
                      </Badge>
                    )}

                    {exam._count.questions > 0 ? (
                      <form action={activateExam.bind(null, exam.id)}>
                        <Button size="sm">Activate</Button>
                      </form>
                    ) : (
                      <Button size="sm" disabled>
                        Import Questions First
                      </Button>
                    )}

                    <form action={draftExam.bind(null, exam.id)}>
                      <Button size="sm" variant="outline">
                        Back to Draft
                      </Button>
                    </form>
                  </>
                )}

                {exam.status === "ACTIVE" && (
                  <form action={closeExam.bind(null, exam.id)}>
                    <Button size="sm" variant="destructive">
                      Close
                    </Button>
                  </form>
                )}

                {exam.status === "CLOSED" && (
                  <form action={activateExam.bind(null, exam.id)}>
                    <Button size="sm">Reopen</Button>
                  </form>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
