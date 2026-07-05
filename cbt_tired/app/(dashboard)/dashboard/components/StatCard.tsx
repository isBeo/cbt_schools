import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import { LucideIcon } from "lucide-react"

type Props = {
  title: string
  value: number
  icon: LucideIcon
  description?: string
}

export function StatCard({ title, value, icon: Icon, description }: Props) {
  return (
    <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>

        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-4xl font-bold">{value.toLocaleString()}</div>

        {description && (
          <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4" />
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
