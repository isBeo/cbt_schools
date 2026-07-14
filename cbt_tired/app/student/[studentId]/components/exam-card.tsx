import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Props = {
  id: number
  title: string
  subject: string
  duration: number
  studentId: number
}

export function ExamCard({ id, title, subject, duration, studentId }: Props) {
  return (
    <Card className="transition hover:border-primary hover:shadow-md">
      <Link href={`/exam/${id}?student=${studentId}`} className="block p-6">
        <CardHeader className="p-0">
          <CardTitle>{subject}</CardTitle>
          <CardDescription>{title}</CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4">
          <Button>Start Exam</Button>
        </CardContent>
      </Link>
    </Card>
  )
}
