"use client"

import { useMemo, useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  createBankQuestion,
  updateBankQuestion,
  archiveBankQuestion,
} from "../actions"

type OptionInput = {
  optionText: string
  isCorrect: boolean
  optionOrder: number
}

type Question = {
  id: number
  questionText: string
  marks: number
  classId: number
  subjectId: number
  className: string
  subjectName: string
  createdByName: string
  createdAt: string
  options: {
    id: number
    optionText: string
    isCorrect: boolean
    optionOrder: number
  }[]
}

type Props = {
  classes: { id: number; name: string }[]
  subjects: { id: number; name: string }[]
  questions: Question[]
  isTeacher: boolean
  assignments: string[]
}

const emptyOptions = (): OptionInput[] =>
  Array.from({ length: 4 }, (_, index) => ({
    optionText: "",
    isCorrect: index === 0,
    optionOrder: index + 1,
  }))

export default function CreateQuestion({
  classes,
  subjects,
  questions,
  isTeacher,
  assignments,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [questionText, setQuestionText] = useState("")
  const [marks, setMarks] = useState("1")
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [options, setOptions] = useState<OptionInput[]>(emptyOptions())
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const availableSubjects = useMemo(() => {
    if (!isTeacher || !classId) return subjects

    return subjects.filter((subject) =>
      assignments.includes(`${classId}-${subject.id}`)
    )
  }, [subjects, classId, isTeacher, assignments])

  const filteredQuestions = questions.filter((question) => {
    const term = search.toLowerCase()

    return (
      question.questionText.toLowerCase().includes(term) ||
      question.className.toLowerCase().includes(term) ||
      question.subjectName.toLowerCase().includes(term)
    )
  })

  function resetForm() {
    setEditingId(null)
    setQuestionText("")
    setMarks("1")
    setClassId("")
    setSubjectId("")
    setOptions(emptyOptions())
    setError("")
    setMessage("")
  }

  function editQuestion(question: Question) {
    setEditingId(question.id)
    setQuestionText(question.questionText)
    setMarks(String(question.marks))
    setClassId(String(question.classId))
    setSubjectId(String(question.subjectId))
    setOptions(
      question.options.map((option, index) => ({
        optionText: option.optionText,
        isCorrect: option.isCorrect,
        optionOrder: index + 1,
      }))
    )
    setError("")
    setMessage("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function updateOption(index: number, value: string) {
    setOptions((current) =>
      current.map((option, i) =>
        i === index ? { ...option, optionText: value } : option
      )
    )
  }

  function selectCorrectOption(index: number) {
    setOptions((current) =>
      current.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      }))
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!questionText.trim()) {
      setError("Enter the question.")
      return
    }

    if (!classId || !subjectId) {
      setError("Select a class and subject.")
      return
    }

    if (options.some((option) => !option.optionText.trim())) {
      setError("Complete all four options.")
      return
    }

    const input = {
      questionText: questionText.trim(),
      marks: Number(marks),
      classId: Number(classId),
      subjectId: Number(subjectId),
      options: options.map((option, index) => ({
        ...option,
        optionOrder: index + 1,
      })),
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateBankQuestion(editingId, input)
          setMessage("Question updated successfully.")
        } else {
          await createBankQuestion(input)
          setMessage("Question created successfully.")
        }

        resetForm()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.")
      }
    })
  }

  function archiveQuestion(id: number) {
    if (!window.confirm("Archive this question?")) return

    setError("")
    setMessage("")

    startTransition(async () => {
      try {
        await archiveBankQuestion(id)
        setMessage("Question archived successfully.")
        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not archive question."
        )
      }
    })
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Edit Question" : "Create New Question"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Question</label>
            <textarea
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="Enter the examination question"
              rows={3}
              required
              className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Class</label>
              <select
                value={classId}
                onChange={(event) => {
                  setClassId(event.target.value)
                  setSubjectId("")
                }}
                required
                className="w-full rounded-lg border bg-background p-2.5 text-sm"
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Subject</label>
              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                required
                disabled={!classId}
                className="w-full rounded-lg border bg-background p-2.5 text-sm disabled:opacity-50"
              >
                <option value="">Select subject</option>
                {availableSubjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Marks</label>
              <input
                type="number"
                min="1"
                step="1"
                value={marks}
                onChange={(event) => setMarks(event.target.value)}
                required
                className="w-full rounded-lg border bg-background p-2.5 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Answer options</h3>
              <p className="text-xs text-muted-foreground">
                Select the radio button beside the correct answer.
              </p>
            </div>

            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctOption"
                  checked={option.isCorrect}
                  onChange={() => selectCorrectOption(index)}
                  aria-label={`Option ${index + 1} is correct`}
                />
                <span className="w-6 text-sm font-medium">
                  {String.fromCharCode(65 + index)}.
                </span>
                <input
                  value={option.optionText}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                  required
                  className="min-w-0 flex-1 rounded-lg border bg-background p-2.5 text-sm"
                />
                {option.isCorrect && (
                  <span className="text-xs font-medium text-green-600">
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isPending
                ? "Saving..."
                : editingId
                  ? "Update Question"
                  : "Save Question"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={isPending}
                className="rounded-lg border px-5 py-2.5 text-sm"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Saved Questions</h2>
            <p className="text-sm text-muted-foreground">
              {filteredQuestions.length} question(s) available
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions..."
            className="rounded-lg border bg-background p-2.5 text-sm sm:w-72"
          />
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No questions found. Create your first question above.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((question) => (
              <article
                key={question.id}
                className="rounded-xl border bg-card p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="space-y-2">
                    <p className="font-medium">{question.questionText}</p>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{question.className}</span>
                      <span>•</span>
                      <span>{question.subjectName}</span>
                      <span>•</span>
                      <span>{question.marks} mark(s)</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editQuestion(question)}
                      disabled={isPending}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => archiveQuestion(question.id)}
                      disabled={isPending}
                      className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      Archive
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`rounded-lg border p-2 text-sm ${
                        option.isCorrect
                          ? "border-green-500/40 bg-green-500/5"
                          : "bg-muted/30"
                      }`}
                    >
                      {String.fromCharCode(64 + option.optionOrder)}.{" "}
                      {option.optionText}
                      {option.isCorrect && (
                        <span className="ml-2 text-xs font-medium text-green-600">
                          Correct answer
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Created by {question.createdByName} ·{" "}
                  {new Date(question.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
