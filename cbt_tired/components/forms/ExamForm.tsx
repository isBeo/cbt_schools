"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

type ExamFormProps = {
  exam: any
}

export function ExamForm({ exam }: ExamFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const question = exam.questions[currentQuestion]
  if (!question) {
    return <div className="p-6">No questions have been added to this exam.</div>
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{exam.title}</h1>

        <p>
          Question {currentQuestion + 1} of {exam.questions.length}
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
              <input type="radio" name={`question-${question.id}`} />

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
          <Button type="button">Submit Exam</Button>
        )}
      </div>
    </div>
  )
}
