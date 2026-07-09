"use client"

import { createExam } from "@/app/actions/exam"

import { QUESTION_BANKS } from "@/lib/question_banks"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [classId, setClassId] = useState<string | null>(null)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [questionSource, setQuestionSource] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const isFormValid = classId && subjectId && questionSource

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isFormValid) {
      alert(
        "Please select all required fields: Class, Subject, and Question Bank"
      )
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set("classId", classId)
    formData.set("subjectId", subjectId)
    formData.set("questionSource", questionSource)

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
            <Label>Class</Label>

            <Select
              value={classId}
              onValueChange={(value) => setClassId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>

              <SelectContent>
                {classes.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject</Label>

            <Select
              value={subjectId}
              onValueChange={(value) => setSubjectId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>

              <SelectContent>
                {subjects.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Question Bank</Label>

            <Select
              value={questionSource}
              onValueChange={(value) => setQuestionSource(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Question Bank" />
              </SelectTrigger>

              <SelectContent>
                {QUESTION_BANKS.map((bank) => (
                  <SelectItem key={bank.value} value={bank.value}>
                    {bank.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
