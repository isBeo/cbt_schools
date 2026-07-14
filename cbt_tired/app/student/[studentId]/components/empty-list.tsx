import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Available Exams</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground">
          There are currently no published examinations for your class.
        </p>
      </CardContent>
    </Card>
  )
}
