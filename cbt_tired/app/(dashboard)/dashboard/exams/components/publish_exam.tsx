"use client"

import { useState } from "react"

export default function PublishExam({ examId }: { examId: number }) {
  const [message, setMessage] = useState("")

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
        onClick={() => {
          console.log("PLAIN BUTTON CLICKED", examId)
          setMessage(`Button works for exam ${examId}`)
        }}
      >
        Publish
      </button>

      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
