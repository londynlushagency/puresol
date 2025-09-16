"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

type ChartLineLabelProps = {
  chartData: { month: number; [key: string]: number }[];
  chartConfig: ChartConfig;
  title?: string;
  description?: string;
};

export function ChartLineLabel({
  chartData,
  chartConfig,
  title = "Line Chart",
  description = "Monthly Data",
}: ChartLineLabelProps) {
  const lineKeys = Object.keys(chartConfig);

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-48 w-full" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 3)} // can customize further
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent indicator="line" />} />

            {lineKeys.map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="natural"
                stroke={chartConfig[key].color}
                strokeWidth={2}
                dot={{ fill: chartConfig[key].color }}
                activeDot={{ r: 6 }}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  dataKey={key}
                />
              </Line>
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">{description}</div>
      </CardFooter>
    </Card>
  );
}