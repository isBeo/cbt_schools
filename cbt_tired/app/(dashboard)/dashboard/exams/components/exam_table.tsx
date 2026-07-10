import {
  activateExam,
  closeExam,
  draftExam,
  importExamQuestions,
} from "@/app/actions/exam"
import { prisma } from "@/lib/prisma"

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
  const exams = await prisma.exam.findMany({
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
            <TableCell className="font-medium">{exam.title}</TableCell>

            <TableCell>{exam.subject.name}</TableCell>

            <TableCell>{exam.class.name}</TableCell>

            <TableCell>
              <Badge variant="secondary">{exam.status}</Badge>
            </TableCell>

            <TableCell>
              <div className="flex flex-wrap gap-2">
                {exam.status === "DRAFT" && (
                  <Link href={`/dashboard/exams/${exam.id}/questions`}>
                    <Button size="sm" variant="secondary">
                      Manage Questions
                    </Button>
                  </Link>
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
