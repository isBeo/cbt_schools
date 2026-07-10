"use client"

import { createExam } from "@/app/actions/exam"

import { QUESTION_BANKS } from "@/lib/question_banks"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

 
import { useState, useRef } from "react"

type Props = {
  classes: {
    id: number
    name: string
  }[]

  subjects: {
    id: number
    name: string
  }[]
}

export default function CreateExam({ classes, subjects }: Props) {
const [classId, setClassId] = useState("")
const [subjectId, setSubjectId] = useState("")
const [questionSource, setQuestionSource] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  // const isFormValid = classId && subjectId && questionSource
  const isFormValid =
    classId !== "" && subjectId !== "" && questionSource !== ""

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isFormValid) {
      alert(
        "Please select all required fields: Class, Subject, and Question Bank"
      )
      return
    }

   
    const formData = new FormData(e.currentTarget)
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
          ref={formRef}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <Label>Exam Title</Label>

            <Input name="title" required />
          </div>

          <div>
            <Label>Term</Label>

            <Input name="term" required />
          </div>

          <div>
            <Label>Session</Label>

            <Input name="session" required />
          </div>

          <div>
            <Label>Duration (Minutes)</Label>

            <Input type="number" name="durationMinutes" required />
          </div>

          <div>
            <Label>Total Marks</Label>

            <Input type="number" name="totalMarks" required />
          </div>

          <div>
            <Label htmlFor="classId">Class</Label>

            <select
              id="classId"
              name="classId"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
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
              onChange={(e) => setSubjectId(e.target.value)}
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

          <div>
            <Label htmlFor="questionSource">Question Bank</Label>

            <select
              id="questionSource"
              name="questionSource"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={questionSource}
              onChange={(e) => setQuestionSource(e.target.value)}
              required
            >
              <option value="">Select Question Bank</option>

              {QUESTION_BANKS.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </select>
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
