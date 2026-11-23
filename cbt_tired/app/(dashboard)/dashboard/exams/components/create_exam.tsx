
"use client"

import { createExam } from "@/app/actions/exam"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

type Props = {
  classes: { id: number; name: string }[]
  subjects: { id: number; name: string }[]
  bankQuestions: {
    id: number
    questionText: string
    marks: number
    classId: number
    subjectId: number
    options: {
      id: number
      optionText: string
      optionOrder: number
      isCorrect: boolean
    }[]
  }[]
}

export default function CreateExam({
  classes,
  subjects,
  bankQuestions,
}: Props) {
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([])

  const filteredQuestions = bankQuestions.filter(
    (question) =>
      Number(question.classId) === Number(classId) &&
      Number(question.subjectId) === Number(subjectId)
  )

  const selectedMarks = bankQuestions
    .filter((question) => selectedQuestionIds.includes(question.id))
    .reduce((total, question) => total + question.marks, 0)

  const isFormValid =
    classId !== "" &&
    subjectId !== "" &&
    selectedQuestionIds.length > 0

  const toggleQuestion = (questionId: number) => {
    setSelectedQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isFormValid) {
      alert("Please select a class, subject and at least one question.")
      return
    }

    const formData = new FormData(e.currentTarget)

    selectedQuestionIds.forEach((id) => {
      formData.append("bankQuestionIds", id.toString())
    })

    await createExam(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Exam</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <Label htmlFor="title">Exam Title</Label>
            <Input id="title" name="title" required />
          </div>

          <div>
            <Label htmlFor="term">Term</Label>
            <Input id="term" name="term" required />
          </div>

          <div>
            <Label htmlFor="session">Session</Label>
            <Input id="session" name="session" required />
          </div>

          <div>
            <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
            <Input
              id="durationMinutes"
              type="number"
              name="durationMinutes"
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="totalMarks">Total Marks</Label>
            <Input
              id="totalMarks"
              type="number"
              name="totalMarks"
              value={selectedMarks}
              readOnly
              required
            />
          </div>

          <div>
            <Label htmlFor="classId">Class</Label>
            <select
              id="classId"
              name="classId"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value)
                setSelectedQuestionIds([])
              }}
              required
            >
              <option value="">Select Class</option>

              {classes.map((item) => (
                <option key={item.id} value={item.id.toString()}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="subjectId">Subject</Label>
            <select
              id="subjectId"
              name="subjectId"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setSelectedQuestionIds([])
              }}
              required
            >
              <option value="">Select Subject</option>

              {subjects.map((item) => (
                <option key={item.id} value={item.id.toString()}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div>
              <Label>Choose Questions</Label>
              <p className="text-sm text-muted-foreground">
                Select the questions to include in this exam.
              </p>
            </div>

            {!classId || !subjectId ? (
              <p className="text-sm text-muted-foreground">
                Select a class and subject to see available questions.
              </p>
            ) : filteredQuestions.length === 0 ? (
              <p className="text-sm text-destructive">
                No active questions found for this class and subject.
              </p>
            ) : (
              filteredQuestions.map((question, index) => (
                <label
                  key={question.id}
                  className="flex cursor-pointer gap-3 rounded-md border p-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestionIds.includes(question.id)}
                    onChange={() => toggleQuestion(question.id)}
                    className="mt-1"
                  />

                  <span className="space-y-1">
                    <span className="block font-medium">
                      {index + 1}. {question.questionText}
                    </span>

                    <span className="block text-sm text-muted-foreground">
                      {question.marks} mark(s) · {question.options.length} options
                    </span>
                  </span>
                </label>
              ))
            )}

            <p className="text-sm font-medium">
              Selected: {selectedQuestionIds.length} question(s)
              {" · "}
              Total: {selectedMarks} marks
            </p>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={!isFormValid}>
              Create Exam
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
