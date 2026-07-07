"use client"
import { submitExam } from "@/app/actions/exam"
import { useRouter } from "next/navigation"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"

type ExamFormProps = {
  exam: any
  studentId: number
  duration: number
}
export function ExamForm({ exam, studentId, duration }: ExamFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  
  const router = useRouter()

  const handleSubmit = async () => {
  const result = await submitExam({
    studentId,
    examId: exam.id,
    answers,
  })

  if (result.success) {
    router.push(`/result/${result.attemptId}`)
  }
}
  const question = exam.questions[currentQuestion]
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(duration * 60)

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // async function handleSubmit() {
  //   const result = await submitExam({
  //     studentId,
  //     examId: exam.id,
  //     answers,
  //   })

  //   if (result.success) {
  //     window.location.href = `/result/${result.attemptId}`
  //   }

  //   if (result.success) {
  //     alert("Exam submitted successfully!")
  //   }
  // }
  if (!question) {
    return <div className="p-6">No questions have been added to this exam.</div>
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        
        
        <p className="rounded bg-red-600 px-4 py-2 text-center text-xl font-bold text-white">
  {Math.floor(timeLeft / 60)}:
  {(timeLeft % 60).toString().padStart(2, "0")}
</p>

        <p className="text-sm text-muted-foreground">
          Answered {Object.keys(answers).length} of {exam.questions.length}
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-6 text-lg font-semibold">{question.questionText}</h2>

        <div className="space-y-3">
          {question.options.map((option: any) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded border p-3"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={answers[question.id] === option.id}
                onChange={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: option.id,
                  }))
                }
              />

              {option.optionText}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
        >
          Previous
        </Button>

        {currentQuestion < exam.questions.length - 1 ? (
          <Button
            type="button"
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
          >
            Next
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit}>
            Submit Exam
          </Button>
        )}
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Question Palette</h3>

        <div className="grid grid-cols-5 gap-2">
          {exam.questions.map((q: any, index: number) => {
            const current = index === currentQuestion
            const answered = answers[q.id]

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentQuestion(index)}
                className={`rounded p-2 text-sm font-medium ${
                  current
                    ? "bg-blue-600 text-white"
                    : answered
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-black"
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex gap-6 text-sm">
          <span>🟦 Current</span>
          <span>🟩 Answered</span>
          <span>⬜ Not Answered</span>
        </div>
      </div>
    </div>
  )
}
