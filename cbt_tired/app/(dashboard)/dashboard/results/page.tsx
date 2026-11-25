
import ResultTable from "./components/result_table"

type ResultsPageProps = {
  searchParams: Promise<{
    classId?: string
    subjectId?: string
    examId?: string
  }>
}

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  const { classId, subjectId, examId } = await searchParams

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Examination Results</h1>
        <p className="text-muted-foreground">
          View examination performance and student results.
        </p>
      </div>

      <ResultTable
        selectedClassId={classId}
        selectedSubjectId={subjectId}
        selectedExamId={examId}
      />
    </div>
  )
}
