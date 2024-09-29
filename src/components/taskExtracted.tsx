"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A donut chart with text"


const chartConfig = {
  visitors: {
    label: "Tasks",
  },
  chrome: {
    label: "Data Extracted",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Faild",
    color: "rgb(185 28 28)",
  },
} satisfies ChartConfig

export function TaskExtracted({taskExtracted, failed, title}: {taskExtracted: number, failed: number, title: string}) {
    const chartData = [
        { Tasks: "Data Extracted", visitors: taskExtracted, fill: "var(--color-chrome)" },
        { Tasks: "Faild", visitors: failed, fill: "var(--color-safari)" },
      ]
    const totalVisitors = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
    }, [])

  return (
    <Card className="flex flex-col bg-transparent border-gray-600">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="Tasks"
              innerRadius={40}
              strokeWidth={4}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Tasks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total tasks uploaded 
        </div>
      </CardFooter>
    </Card>
  )
}
