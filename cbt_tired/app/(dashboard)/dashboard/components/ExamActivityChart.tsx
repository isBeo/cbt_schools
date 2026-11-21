"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"

export type ExamActivityPoint = {
  date: string
  attempts: number
}

const chartConfig = {
  attempts: {
    label: "Exam Attempts",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type Props = {
  data: ExamActivityPoint[]
}

export function ExamActivityChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Activity</CardTitle>
        <CardDescription>
          Student exam participation over the last seven days
        </CardDescription>
      </CardHeader>

      <CardContent>
        {data.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="h-[280px]"
            height={280}
          >
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="attempts"
                fill="var(--color-attempts)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No exam activity recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}