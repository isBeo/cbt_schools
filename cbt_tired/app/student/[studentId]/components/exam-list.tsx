import { ExamCard } from "./exam-card"

type Exam = {
  id: number
  title: string
  durationMinutes: number
  subject: {
    name: string
  }
}

type Props = {
  exams: Exam[]
  studentId: number
}

export function ExamList({ exams, studentId }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          id={exam.id}
          title={exam.title}
          subject={exam.subject.name}
          duration={exam.durationMinutes}
          studentId={studentId}
        />
      ))}
    </div>
  )
}
