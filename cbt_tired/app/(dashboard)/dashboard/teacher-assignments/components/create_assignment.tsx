
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createTeacherAssignment } from "../actions"

type Teacher = {
  id: number
  name: string
  email: string
}

type SchoolClass = {
  id: number
  name: string
  level: string
}

type Subject = {
  id: number
  name: string
  code: string
}

type CreateAssignmentProps = {
  teachers: Teacher[]
  classes: SchoolClass[]
  subjects: Subject[]
}

export function CreateAssignment({
  teachers,
  classes,
  subjects,
}: CreateAssignmentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [teacherId, setTeacherId] = useState("")
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const hasRequiredRecords =
    teachers.length > 0 && classes.length > 0 && subjects.length > 0

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    startTransition(async () => {
      const result = await createTeacherAssignment({
        teacherId: Number(teacherId),
        classId: Number(classId),
        subjectId: Number(subjectId),
      })

      setMessage(result.message)
      setIsError(!result.success)

      if (result.success) {
        setTeacherId("")
        setClassId("")
        setSubjectId("")
        router.refresh()
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border bg-card p-5"
    >
      <div>
        <h2 className="text-lg font-semibold">Assign Teacher</h2>
        <p className="text-sm text-muted-foreground">
          Select a teacher, class and subject for the assignment.
        </p>
      </div>

      {!hasRequiredRecords && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          {teachers.length === 0 && (
            <p>No teacher accounts found. Create teacher accounts first.</p>
          )}
          {classes.length === 0 && (
            <p>No classes found. Create classes first.</p>
          )}
          {subjects.length === 0 && (
            <p>No subjects found. Create subjects first.</p>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="teacher" className="text-sm font-medium">
            Teacher
          </label>

          <select
            id="teacher"
            value={teacherId}
            onChange={(event) => setTeacherId(event.target.value)}
            required
            disabled={isPending || teachers.length === 0}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="class" className="text-sm font-medium">
            Class
          </label>

          <select
            id="class"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            required
            disabled={isPending || classes.length === 0}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select class</option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject
          </label>

          <select
            id="subject"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            required
            disabled={isPending || subjects.length === 0}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={`text-sm ${
            isError ? "text-destructive" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !hasRequiredRecords}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Assigning..." : "Assign Teacher"}
      </button>
    </form>
  )
}
