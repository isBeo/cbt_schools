
"use client"

import { submitExam } from "@/app/actions/exam"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"

type ExamWithQuestions = {
  id: number
  title: string
  questions: {
    id: number
    questionText: string
    options: {
      id: number
      optionText: string
    }[]
  }[]
}

type ExamFormProps = {
  exam: ExamWithQuestions
  duration: number
}

export function ExamForm({ exam, duration }: ExamFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(duration * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  // Prevent two submissions from starting at the same time.
  const submittingRef = useRef(false)

  // Prevent automatic submission from repeatedly retrying after an error.
  const autoSubmitAttemptedRef = useRef(false)

  const question = exam.questions[currentQuestion]

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return

    submittingRef.current = true
    setIsSubmitting(true)
    setError("")

    try {
      const result = await submitExam({
        examId: exam.id,
        answers,
      })

      if (result.success) {
        router.push(`/result/${result.attemptId}`)
      } else {
        submittingRef.current = false
        setIsSubmitting(false)
        setError("Unable to submit your exam. Please try again.")
      }
    } catch (err) {
      submittingRef.current = false
      setIsSubmitting(false)

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your exam. Please try again."
      )
    }
  }, [exam.id, answers, router])

  // Countdown timer.
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitting) return

    const timer = setTimeout(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isSubmitting])

  // Automatically submit when the countdown reaches zero.
  useEffect(() => {
    if (
      timeLeft === 0 &&
      !isSubmitting &&
      !autoSubmitAttemptedRef.current
    ) {
      autoSubmitAttemptedRef.current = true
      void handleSubmit()
    }
  }, [timeLeft, isSubmitting, handleSubmit])

  if (!question) {
    return (
      <div className="p-6">
        No questions have been added to this exam.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-3 text-2xl font-bold">{exam.title}</h1>

        <p className="rounded bg-red-600 px-4 py-2 text-center text-xl font-bold text-white">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Answered {Object.keys(answers).length} of {exam.questions.length}
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {timeLeft === 0 && (
        <p className="text-sm font-medium text-red-600">
          Time is up. Your exam is being submitted.
        </p>
      )}

      <div className="rounded-lg border p-6">
        <h2 className="mb-6 text-lg font-semibold">
          {question.questionText}
        </h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded border p-3"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={answers[question.id] === option.id}
                disabled={isSubmitting || timeLeft === 0}
                onChange={() =>
                  setAnswers((previous) => ({
                    ...previous,
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
          disabled={currentQuestion === 0 || isSubmitting || timeLeft === 0}
          onClick={() => setCurrentQuestion((previous) => previous - 1)}
        >
          Previous
        </Button>

        {currentQuestion < exam.questions.length - 1 ? (
          <Button
            type="button"
            disabled={isSubmitting || timeLeft === 0}
            onClick={() => setCurrentQuestion((previous) => previous + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </Button>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Question Palette</h3>

        <div className="grid grid-cols-5 gap-2">
          {exam.questions.map((q, index) => {
            const current = index === currentQuestion
            const answered = answers[q.id]

            return (
              <button
                key={q.id}
                type="button"
                disabled={isSubmitting || timeLeft === 0}
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

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Exam"}
      </Button>
    </div>
  )
}
