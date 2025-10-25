"use client";

import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface Progress {
  date_created?: string;
  source?: string;
  activitystatus?: string;
  startdate?: string;
  enddate?: string;
}

interface Card7Props {
  filteredProgress: Progress[];
}

function formatTotalSeconds(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

const COLORS = {
  responseTimeSec: "var(--chart-1)",
  rfqTimeSec: "var(--chart-2)",
  nonRFQTimeSec: "var(--chart-3)",
};

const LABELS = {
  responseTimeSec: "Total Response Time",
  rfqTimeSec: "RFQ Handling Time",
  nonRFQTimeSec: "Non-RFQ Handling Time",
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded p-2 shadow-md text-xs">
        {payload.map((p: any) => {
          const key = p.dataKey as keyof typeof LABELS;
          return (
            <div key={p.dataKey} className="flex justify-between">
              <span className="font-medium">{LABELS[key]}</span>
              <span>{formatTotalSeconds(p.value)}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};


const Card7: React.FC<Card7Props> = ({ filteredProgress }) => {
  const csrData = useMemo(() => {
    return filteredProgress
      .filter(
        (p) =>
          p.source === "CSR Inquiry" &&
          (p.activitystatus === "Quote-Done" || p.activitystatus === "Assisted")
      )
      .map((p) => {
        if (!p.startdate || !p.enddate)
          return { ...p, responseTimeSec: 0, rfqTimeSec: 0, nonRFQTimeSec: 0 };
        const start = new Date(p.startdate);
        const end = new Date(p.enddate);
        const responseTimeSec = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
        return {
          ...p,
          responseTimeSec,
          rfqTimeSec: p.activitystatus === "Quote-Done" ? responseTimeSec : 0,
          nonRFQTimeSec: p.activitystatus === "Assisted" ? responseTimeSec : 0,
        };
      });
  }, [filteredProgress]);

  const dailyAggregated = useMemo(() => {
    const grouped: Record<string, { responseTimeSec: number; rfqTimeSec: number; nonRFQTimeSec: number }> = {};
    csrData.forEach((p) => {
      const key = p.date_created ? new Date(p.date_created).toLocaleDateString() : "-";
      if (!grouped[key]) grouped[key] = { responseTimeSec: 0, rfqTimeSec: 0, nonRFQTimeSec: 0 };
      grouped[key].responseTimeSec += p.responseTimeSec || 0;
      grouped[key].rfqTimeSec += p.rfqTimeSec || 0;
      grouped[key].nonRFQTimeSec += p.nonRFQTimeSec || 0;
    });
    return Object.entries(grouped)
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [csrData]);

  const totals = useMemo(() => {
    const result: Record<keyof typeof COLORS, number> = {
      responseTimeSec: 0,
      rfqTimeSec: 0,
      nonRFQTimeSec: 0,
    };
    dailyAggregated.forEach((d) => {
      Object.keys(COLORS).forEach((key) => {
        const k = key as keyof typeof COLORS;
        result[k] += d[k] || 0;
      });
    });
    return result;
  }, [dailyAggregated]);

  // Inside Card7 component, after dailyAggregated and totals

  const trendPercentage = useMemo(() => {
    if (dailyAggregated.length < 2) return 0;

    // Compare total responseTimeSec from earliest vs latest day
    const firstTotal = Object.keys(COLORS).reduce(
      (sum, key) => sum + (dailyAggregated[dailyAggregated.length - 1][key as keyof typeof COLORS] || 0),
      0
    );
    const lastTotal = Object.keys(COLORS).reduce(
      (sum, key) => sum + (dailyAggregated[0][key as keyof typeof COLORS] || 0),
      0
    );

    if (firstTotal === 0) return 100;
    return +(((lastTotal - firstTotal) / firstTotal) * 100).toFixed(1);
  }, [dailyAggregated]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>CSR Metrics (Avg Response Time)</CardTitle>
      </CardHeader>

      <CardContent>
        {dailyAggregated.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">No CSR Inquiry data available.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dailyAggregated} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid vertical={true} horizontal={false} stroke="#ccc" strokeDasharray="2 2" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatTotalSeconds(val)}
                />
                <Tooltip content={<CustomTooltip />} />

                <defs>
                  {Object.keys(COLORS).map((key) => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[key as keyof typeof COLORS]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS[key as keyof typeof COLORS]} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>

                {Object.keys(COLORS).map((key) => (
                  <Area
                    key={key}
                    type="natural"
                    dataKey={key}
                    stroke={COLORS[key as keyof typeof COLORS]}
                    fill={`url(#grad-${key})`}
                    fillOpacity={0.4}
                    stackId="a"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div className="flex justify-center gap-8 mt-4 flex-wrap">
              {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => (
                <div key={key} className="flex items-center gap-2 select-none">
                  <div className="rounded-full w-4 h-4" style={{ backgroundColor: COLORS[key] }} />
                  <div className="text-xs flex flex-col">
                    <span className="font-medium">{LABELS[key]}</span>
                    <span className="text-gray-500">{formatTotalSeconds(totals[key])}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trendPercentage >= 0 ? "Trending up" : "Trending down"} by {Math.abs(trendPercentage)}% this period{" "}
              <TrendingUp className="h-4 w-4" />
            </div>

            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing aggregated response times for CSR Inquiry
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Card7;
