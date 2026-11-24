import Link from "next/link"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Props = {
  id: number
  title: string
  subject: string
  duration: number
  // studentId: number
}

export function ExamCard({ id, title, subject, duration }: Props) {
  return (
    <Card className="transition hover:border-primary hover:shadow-md">
      <Link href={`/exam/${id}`} className="block p-6">
        <CardHeader className="p-0">
          <CardTitle>{subject}</CardTitle>
          <CardDescription>{title}</CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Duration: {duration} minutes
          </p>
          <Button>Start Exam</Button>
        </CardContent>
      </Link>
    </Card>
  )
}
