"use client";

import React, { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Text, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Progress {
  source?: string;
  date_created?: string;
}

interface Card5Props {
  filteredProgress: Progress[];
}

export const description = "A horizontal bar chart showing call sources";

export const chartConfig = {
  desktop: {
    label: "Calls",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Custom Y-axis tick component with wrapping & ellipsis
const YAxisTick: React.FC<any> = ({ x, y, payload, maxWidth = 140 }) => {
  const words = payload.value.split(" ");
  const lineHeight = 12;

  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word: string, index: number) => {
        const displayWord = word.length > 15 ? word.slice(0, 12) + "…" : word; // ellipsis
        return (
          <Text
            key={index}
            x={0}
            y={index * lineHeight}
            textAnchor="end"
            verticalAnchor="middle"
            fontSize={12}
            width={maxWidth}
          >
            {displayWord}
          </Text>
        );
      })}
    </g>
  );
};

const Card5: React.FC<Card5Props> = ({ filteredProgress }) => {
  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    filteredProgress.forEach((p) => {
      const key = p.source || "Unknown";
      dataMap[key] = (dataMap[key] || 0) + 1;
    });

    return Object.entries(dataMap).map(([source, count]) => ({
      month: source,
      desktop: count,
    }));
  }, [filteredProgress]);

  // Dynamic trend calculation
  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].desktop;
    const last = chartData[chartData.length - 1].desktop;
    if (first === 0) return 100;
    return +(((last - first) / first) * 100).toFixed(1);
  }, [chartData]);

  // Calculate left margin dynamically
  const leftMargin = useMemo(() => {
    const maxLength = Math.max(...chartData.map((d) => d.month.length));
    return Math.min(Math.max(maxLength * 7, 80), 40); // min 80px, max 140px
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Breakdown</CardTitle>
        <CardDescription>Overview of calls by source</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: leftMargin, right: 5, top: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" dataKey="desktop" hide />
              <YAxis
                dataKey="month"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={leftMargin}
                tick={<YAxisTick maxWidth={leftMargin} />}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar
                dataKey="desktop"
                fill="var(--color-desktop)"
                radius={5}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trend >= 0 ? "Trending up" : "Trending down"} by {Math.abs(trend)}% this period{" "}
          {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total source for the selected sources
        </div>
      </CardFooter>
    </Card>
  );
};

export default Card5;
