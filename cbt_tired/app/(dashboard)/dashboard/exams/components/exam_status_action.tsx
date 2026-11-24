import {
  activateExam,
  closeExam,
  draftExam,
  publishExam,
} from "@/app/actions/exam"

type ExamAction = "publish" | "activate" | "close" | "draft"

type Props = {
  examId: number
  action: ExamAction
}

export default function ExamStatusAction({ examId, action }: Props) {
  async function handleSubmit() {
    "use server"

    switch (action) {
      case "publish":
        await publishExam(examId)
        break
      case "activate":
        await activateExam(examId)
        break
      case "close":
        await closeExam(examId)
        break
      case "draft":
        await draftExam(examId)
        break
    }
  }

  const labels: Record<ExamAction, string> = {
    publish: "Publish",
    activate: "Activate",
    close: "Close",
    draft: "Back to Draft",
  }

  return (
    <form action={handleSubmit}>
      <button
        type="submit"
        className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
      >
        {labels[action]}
      </button>
    </form>
  )
}
