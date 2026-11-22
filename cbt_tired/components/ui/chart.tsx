"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

type ChartContainerProps = {
  config: ChartConfig
  children: React.ReactElement
  className?: string
  height?: number
}

export function ChartContainer({
  config,
  children,
  className,
  height = 300,
}: ChartContainerProps) {
  const id = React.useId().replace(/:/g, "")

  const chartStyle = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      `--color-${key}`,
      value.color ?? "var(--chart-1)",
    ])
  ) as React.CSSProperties

  return (
    <div
      data-chart={id}
      className={`w-full ${className ?? ""}`}
      style={chartStyle}
    >
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}
