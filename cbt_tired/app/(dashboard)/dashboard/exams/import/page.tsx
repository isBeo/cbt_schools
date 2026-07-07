import { importBusinessStudiesExam } from "@/app/actions/exam"

export default function ImportExamPage() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Import Business Studies Exam</h1>

      <form
        action={async () => {
          "use server"
          await importBusinessStudiesExam()
        }}
      >
        <button
          className="rounded-md bg-primary px-6 py-3 text-primary-foreground"
          type="submit"
        >
          Import Exam
        </button>
      </form>
    </main>
  )
}
