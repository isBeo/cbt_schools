import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  firstName: string
  lastName: string
  className: string
}

export function StudentHeader({ firstName, lastName, className }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Welcome, {firstName} {lastName}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Badge variant="secondary">{className}</Badge>

        <p className="mt-4 text-sm text-muted-foreground">
          Select an examination below to begin.
        </p>
      </CardContent>
    </Card>
  )
}
