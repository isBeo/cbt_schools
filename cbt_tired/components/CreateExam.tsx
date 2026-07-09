import { createExam } from "@/app/actions/exam"
import { prisma } from "@/lib/prisma"
import { QUESTION_BANKS } from "@/lib/question_banks"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default async function CreateExam() {
  const subjects = await prisma.subject.findMany({
    orderBy: {
      name: "asc",
    },
  })

  const classes = await prisma.class.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <Dialog>
      <DialogTrigger >
        <Button>Create Exam</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Exam</DialogTitle>
        </DialogHeader>

        <form action={createExam} className="space-y-4">
          <Input name="title" placeholder="Exam Title" required />

          <select
            name="subjectId"
            className="w-full rounded-md border p-2"
            required
          >
            <option value="">Select Subject</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          <select
            name="classId"
            className="w-full rounded-md border p-2"
            required
          >
            <option value="">Select Class</option>

            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <Input name="term" placeholder="Term" required />

          <Input name="session" placeholder="2025/2026" required />

          <Input
            name="durationMinutes"
            type="number"
            placeholder="Duration (minutes)"
            required
          />

          <Input
            name="totalMarks"
            type="number"
            placeholder="Total Marks"
            required
          />

          <select
            name="questionSource"
            className="w-full rounded-md border p-2"
            required
          >
            <option value="">Select Question Bank</option>

            {QUESTION_BANKS.map((bank) => (
              <option key={bank.value} value={bank.value}>
                {bank.label}
              </option>
            ))}
          </select>

          <Button type="submit" className="w-full">
            Create Exam
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
