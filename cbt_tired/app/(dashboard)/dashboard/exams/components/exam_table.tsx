import DeleteExam from "./delete_exam"
import ExamStatusAction from "./exam_status_action"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

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

    if (!Number.isInteger(teacherId) || !schoolId) {
      redirect("/dashboard")
    }

    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        teacherId,
        class: {
          schoolId,
        },
      },
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
        {exams.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-8 text-center text-muted-foreground"
            >
              No exams found.
            </TableCell>
          </TableRow>
        ) : (
          exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.title}</TableCell>

              <TableCell>{exam.subject.name}</TableCell>

              <TableCell>{exam.class.name}</TableCell>

              <TableCell>
                <Badge variant="secondary">{exam.status}</Badge>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                  {/* DRAFT EXAM */}
                  {exam.status === "DRAFT" && (
                    <>
                      <Link href={`/dashboard/exams/${exam.id}/questions`}>
                        <Button size="sm" variant="secondary">
                          Manage Questions
                        </Button>
                      </Link>

                      <ExamStatusAction examId={exam.id} action="publish" />

                      {(role === "SUPER_ADMIN" || role === "SCHOOL_ADMIN") && (
                        <DeleteExam examId={exam.id} examTitle={exam.title} />
                      )}
                    </>
                  )}

                  {/* PUBLISHED EXAM */}
                  {exam.status === "PUBLISHED" && (
                    <>
                      <Badge variant="default">
                        {exam._count.questions} Questions Ready
                      </Badge>

                      {exam._count.questions > 0 ? (
                        <ExamStatusAction examId={exam.id} action="activate" />
                      ) : (
                        <Button size="sm" disabled>
                          No Questions Available
                        </Button>
                      )}

                      <ExamStatusAction examId={exam.id} action="draft" />
                    </>
                  )}

                  {/* ACTIVE EXAM */}
                  {exam.status === "ACTIVE" && (
                    <ExamStatusAction examId={exam.id} action="close" />
                  )}

                  {/* CLOSED EXAM */}
                  {exam.status === "CLOSED" && (
                    <ExamStatusAction examId={exam.id} action="activate" />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
