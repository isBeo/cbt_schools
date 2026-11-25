
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"
import { redirect } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ResultWithRelations = Prisma.ResultGetPayload<{
  include: {
    attempt: {
      include: {
        student: { include: { class: true } }
        exam: { include: { subject: true } }
      }
    }
  }
}>

type ResultTableProps = {
  selectedClassId?: string
  selectedSubjectId?: string
  selectedExamId?: string
}

type FilterSubject = {
  id: number
  name: string
}

type FilterExam = {
  id: number
  title: string
  subject: FilterSubject
}

export default async function ResultTable({
  selectedClassId: requestedClassId,
  selectedSubjectId: requestedSubjectId,
  selectedExamId: requestedExamId,
}: ResultTableProps) {
  const session = await auth()

  if (!session?.user?.role) {
    redirect("/login")
  }

  const { role, schoolId, id } = session.user

  let classes: { id: number; name: string }[] = []
  let subjects: FilterSubject[] = []
  let where: Prisma.ResultWhereInput = {}
  let hasTeacherAssignments = true

  let assignments: {
    classId: number
    subjectId: number
    class: { id: number; name: string }
    subject: FilterSubject
  }[] = []

  const examScopeConditions: Prisma.ExamWhereInput[] = []

  if (role === "SUPER_ADMIN") {
    classes = await prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  } else if (role === "SCHOOL_ADMIN") {
    if (!schoolId) {
      return <p>School account is not properly configured.</p>
    }

    classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    where = {
      attempt: {
        student: { schoolId },
      },
    }

    examScopeConditions.push({
      class: { schoolId },
    })
  } else if (role === "TEACHER") {
    if (!schoolId) {
      return <p>Teacher account is not properly configured.</p>
    }

    assignments = await prisma.teacherAssignment.findMany({
      where: {
        teacherId: Number(id),
        class: { schoolId },
      },
      select: {
        classId: true,
        subjectId: true,
        class: {
          select: { id: true, name: true },
        },
        subject: {
          select: { id: true, name: true },
        },
      },
    })

    classes = Array.from(
      new Map(
        assignments.map((assignment) => [
          assignment.classId,
          assignment.class,
        ])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name))

    subjects = Array.from(
      new Map(
        assignments.map((assignment) => [
          assignment.subjectId,
          assignment.subject,
        ])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name))

    hasTeacherAssignments = assignments.length > 0

    where = {
      attempt: {
        student: { schoolId },
        exam: {
          OR: assignments.map((assignment) => ({
            classId: assignment.classId,
            subjectId: assignment.subjectId,
          })),
        },
      },
    }

    if (hasTeacherAssignments) {
      examScopeConditions.push({
        OR: assignments.map((assignment) => ({
          classId: assignment.classId,
          subjectId: assignment.subjectId,
        })),
      })
    }
  } else {
    return <p>You are not authorised to view examination results.</p>
  }

  // Validate the selected class.
  const parsedClassId = Number(requestedClassId)

  const validClassId =
    requestedClassId &&
    Number.isInteger(parsedClassId) &&
    classes.some((item) => item.id === parsedClassId)
      ? parsedClassId
      : undefined

  // Get subjects available within the permitted scope.
  if (role !== "TEACHER") {
    const subjectConditions = [...examScopeConditions]

    if (validClassId) {
      subjectConditions.push({ classId: validClassId })
    }

    const availableExams = await prisma.exam.findMany({
      where:
        subjectConditions.length > 0
          ? { AND: subjectConditions }
          : {},
      select: {
        subject: {
          select: { id: true, name: true },
        },
      },
      distinct: ["subjectId"],
    })

    subjects = availableExams
      .map((exam) => exam.subject)
      .sort((a, b) => a.name.localeCompare(b.name))
  } else if (validClassId) {
    subjects = Array.from(
      new Map(
        assignments
          .filter((assignment) => assignment.classId === validClassId)
          .map((assignment) => [
            assignment.subjectId,
            assignment.subject,
          ])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name))
  }

  // Validate the selected subject.
  const parsedSubjectId = Number(requestedSubjectId)

  const validSubjectId =
    requestedSubjectId &&
    Number.isInteger(parsedSubjectId) &&
    subjects.some((item) => item.id === parsedSubjectId)
      ? parsedSubjectId
      : undefined

  // Get examinations available within the selected filters.
  const examConditions = [...examScopeConditions]

  if (validClassId) {
    examConditions.push({ classId: validClassId })
  }

  if (validSubjectId) {
    examConditions.push({ subjectId: validSubjectId })
  }

  const availableExams: FilterExam[] = hasTeacherAssignments
    ? await prisma.exam.findMany({
        where: examConditions.length > 0
          ? { AND: examConditions }
          : {},
        select: {
          id: true,
          title: true,
          subject: {
            select: { id: true, name: true },
          },
        },
        orderBy: { title: "asc" },
      })
    : []

  // Validate the selected examination.
  const parsedExamId = Number(requestedExamId)

  const validExamId =
    requestedExamId &&
    Number.isInteger(parsedExamId) &&
    availableExams.some((exam) => exam.id === parsedExamId)
      ? parsedExamId
      : undefined

  // Apply all selected filters without removing access restrictions.
  const additionalFilters: Prisma.ResultWhereInput[] = []

  if (validClassId) {
    additionalFilters.push({
      attempt: {
        exam: { classId: validClassId },
      },
    })
  }

  if (validSubjectId) {
    additionalFilters.push({
      attempt: {
        exam: { subjectId: validSubjectId },
      },
    })
  }

  if (validExamId) {
    additionalFilters.push({
      attempt: {
        exam: { id: validExamId },
      },
    })
  }

  if (additionalFilters.length > 0) {
    where = {
      AND: [where, ...additionalFilters],
    }
  }

  const results: ResultWithRelations[] = hasTeacherAssignments
    ? await prisma.result.findMany({
        where,
        include: {
          attempt: {
            include: {
              student: { include: { class: true } },
              exam: { include: { subject: true } },
            },
          },
        },
        orderBy: { generatedAt: "desc" },
      })
    : []

  return (
    <div className="space-y-4">
      <form method="GET" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="classId" className="text-sm font-medium">
            Filter by class
          </label>

          <select
            id="classId"
            name="classId"
            defaultValue={validClassId?.toString() ?? ""}
            className="h-10 min-w-48 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All classes</option>

            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="subjectId" className="text-sm font-medium">
            Filter by subject
          </label>

          <select
            id="subjectId"
            name="subjectId"
            defaultValue={validSubjectId?.toString() ?? ""}
            className="h-10 min-w-48 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All subjects</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="examId" className="text-sm font-medium">
            Filter by examination
          </label>

          <select
            id="examId"
            name="examId"
            defaultValue={validExamId?.toString() ?? ""}
            className="h-10 min-w-48 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All examinations</option>

            {availableExams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} — {exam.subject.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Apply filters
        </button>
      </form>

      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No examination results found for this selection.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Examination</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {results.map((result) => {
                const { student, exam } = result.attempt

                return (
                  <TableRow key={result.id}>
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.admissionNo}</TableCell>
                    <TableCell>{student.class.name}</TableCell>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{exam.subject.name}</TableCell>
                    <TableCell>
                      {Number(result.score).toFixed(2)} / {exam.totalMarks}
                    </TableCell>
                    <TableCell>
                      {Number(result.percentage).toFixed(1)}%
                    </TableCell>
                    <TableCell>{result.grade}</TableCell>
                    <TableCell>
                      {result.generatedAt.toLocaleDateString("en-NG")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
