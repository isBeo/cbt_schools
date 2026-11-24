
"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { parseQuestionText } from "@/lib/question-import-parser"
import {
  extractDocxText,
  importBankQuestions,
} from "../actions"

type Props = {
  classes: { id: number; name: string }[]
  subjects: { id: number; name: string }[]
  isTeacher: boolean
  assignments: string[]
}

export default function BulkQuestionImport({
  classes,
  subjects,
  isTeacher,
  assignments,
}: Props) {
  const router = useRouter()

  const [text, setText] = useState("")
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isReadingFile, setIsReadingFile] = useState(false)

  const parsed = useMemo(
    () => parseQuestionText(text),
    [text]
  )

  const availableSubjects = useMemo(() => {
    if (!isTeacher || !classId) return subjects

    return subjects.filter((subject) =>
      assignments.includes(`${classId}-${subject.id}`)
    )
  }, [subjects, assignments, isTeacher, classId])

  function handleTextChange(value: string) {
    setText(value)
    setShowPreview(false)
    setError("")
    setMessage("")
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    setError("")
    setMessage("")
    setShowPreview(false)

    const fileName = file.name.toLowerCase()
    const isTxt = fileName.endsWith(".txt")
    const isDocx = fileName.endsWith(".docx")

    if (!isTxt && !isDocx) {
      setError("Please select a .txt or .docx file.")
      event.target.value = ""
      return
    }

    const maximumSize = isTxt
      ? 1024 * 1024
      : 5 * 1024 * 1024

    if (file.size === 0) {
      setError("The selected file is empty.")
      event.target.value = ""
      return
    }

    if (file.size > maximumSize) {
      setError(
        isTxt
          ? "TXT files must not exceed 1MB."
          : "Word documents must not exceed 5MB."
      )
      event.target.value = ""
      return
    }

    setIsReadingFile(true)

    try {
      let content = ""

      if (isTxt) {
        content = await file.text()
      } else {
        const formData = new FormData()
        formData.append("file", file)

        const result = await extractDocxText(formData)
        content = result.text
      }

      if (!content.trim()) {
        setError("The selected file contains no readable text.")
        return
      }

      handleTextChange(content)
      setShowPreview(true)

      setMessage(
        `${isTxt ? "TXT" : "Word"} document loaded successfully. Review the preview before importing.`
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to read the selected file."
      )
    } finally {
      setIsReadingFile(false)
      event.target.value = ""
    }
  }

  function handleClassChange(value: string) {
    setClassId(value)
    setSubjectId("")
    setError("")
  }

  function handleImport() {
    setError("")
    setMessage("")

    if (!classId || !subjectId) {
      setError("Please select a class and subject.")
      return
    }

    if (!text.trim()) {
      setError("Paste or upload your questions first.")
      return
    }

    if (parsed.errors.length > 0) {
      setError("Please correct all question errors before importing.")
      setShowPreview(true)
      return
    }

    if (parsed.questions.length === 0) {
      setError("No valid questions were found.")
      return
    }

    if (parsed.questions.length > 100) {
      setError("You can import a maximum of 100 questions at a time.")
      return
    }

    startTransition(async () => {
      try {
        const result = await importBankQuestions({
          text,
          classId: Number(classId),
          subjectId: Number(subjectId),
        })

        setMessage(
          `Successfully imported ${result.importedCount} questions.`
        )

        setText("")
        setShowPreview(false)
        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Question import failed."
        )
      }
    })
  }

  return (
    <section className="space-y-5 rounded-xl border bg-card p-5">
      <div>
        <h2 className="text-xl font-semibold">
          Bulk Question Import
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Paste multiple formatted questions or upload a TXT or
          Word document into your Question Bank.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="bulk-class"
            className="text-sm font-medium"
          >
            Class
          </label>

          <select
            id="bulk-class"
            value={classId}
            onChange={(event) =>
              handleClassChange(event.target.value)
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select class</option>

            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="bulk-subject"
            className="text-sm font-medium"
          >
            Subject
          </label>

          <select
            id="bulk-subject"
            value={subjectId}
            onChange={(event) =>
              setSubjectId(event.target.value)
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select subject</option>

            {availableSubjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bulk-file"
          className="text-sm font-medium"
        >
          Upload question file
        </label>

        <input
          id="bulk-file"
          type="file"
          accept=".txt,.docx"
          onChange={handleFileChange}
          disabled={isReadingFile || isPending}
          className="block w-full rounded-md border bg-background p-2 text-sm disabled:opacity-50"
        />

        <p className="text-xs text-muted-foreground">
          Supported files: TXT (maximum 1MB) and DOCX
          (maximum 5MB).
        </p>

        {isReadingFile && (
          <p className="text-sm text-muted-foreground">
            Reading document...
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bulk-question-text"
          className="text-sm font-medium"
        >
          Questions
        </label>

        <textarea
          id="bulk-question-text"
          value={text}
          onChange={(event) =>
            handleTextChange(event.target.value)
          }
          placeholder={`QUESTION: What is the capital of Nigeria?
MARKS: 2
A: Lagos
B: Abuja
C: Kano
D: Port Harcourt
ANSWER: B
---`}
          rows={14}
          className="w-full rounded-md border bg-background p-3 font-mono text-sm"
        />

        <p className="text-xs text-muted-foreground">
          Separate questions with ---. Each question must have
          QUESTION, MARKS, options A-D, and ANSWER. Maximum
          100 questions per import.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setShowPreview(true)
            setError("")
            setMessage("")
          }}
          disabled={!text.trim() || isReadingFile}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Preview Questions
        </button>

        <button
          type="button"
          onClick={handleImport}
          disabled={
            isPending ||
            isReadingFile ||
            !text.trim() ||
            parsed.errors.length > 0 ||
            parsed.questions.length === 0
          }
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isPending ? "Importing..." : "Import Questions"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-md border border-green-500/30 bg-green-500/5 p-3 text-sm">
          {message}
        </div>
      )}

      {showPreview && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <span>
              Total blocks: <strong>{parsed.totalBlocks}</strong>
            </span>

            <span>
              Valid questions: <strong>{parsed.questions.length}</strong>
            </span>

            <span>
              Errors: <strong>{parsed.errors.length}</strong>
            </span>
          </div>

          {parsed.errors.length > 0 && (
            <div className="space-y-2 rounded-md border border-destructive/30 p-3">
              <h3 className="font-semibold text-destructive">
                Please correct these errors
              </h3>

              <ul className="list-disc space-y-1 pl-5 text-sm">
                {parsed.errors.map((issue, index) => (
                  <li key={index}>
                    {issue.questionNumber === 0
                      ? "General"
                      : `Question ${issue.questionNumber}`}
                    : {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsed.questions.map((question, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border p-4"
            >
              <div className="flex justify-between gap-3">
                <h3 className="font-medium">
                  {index + 1}. {question.questionText}
                </h3>

                <span className="shrink-0 text-sm text-muted-foreground">
                  {question.marks} mark(s)
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <div
                    key={option.optionOrder}
                    className={`rounded-md border p-2 text-sm ${
                      option.isCorrect
                        ? "border-green-500 bg-green-500/5"
                        : ""
                    }`}
                  >
                    <span className="font-medium">
                      {String.fromCharCode(
                        64 + option.optionOrder
                      )}
                      .
                    </span>{" "}
                    {option.optionText}

                    {option.isCorrect && (
                      <span className="ml-2 text-green-600">
                        Correct answer
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {parsed.errors.length > 0 && (
            <p className="text-sm text-destructive">
              Import is disabled until every question is valid.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
