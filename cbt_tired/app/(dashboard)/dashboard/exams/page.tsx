import { prisma } from "@/lib/prisma"
import CreateExam from "./components/create_exam"
import ExamTable from "./components/exam_table"

export default async function ExamsPage() {
  const classes = await prisma.class.findMany({
    orderBy: {
      name: "asc",
    },
  })

  const subjects = await prisma.subject.findMany({
    orderBy: {
      name: "asc",
    },
  })
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Exams</h1>
        <p className="text-muted-foreground">
          Create exams, import questions and manage exam status.
        </p>
      </div>

      <CreateExam classes={classes} subjects={subjects} />

      <ExamTable />
    </div>
  )
}
