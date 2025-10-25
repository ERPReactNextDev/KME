"use client";

import React, { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Legend, AreaProps } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface Progress {
  actualsales?: string | number;
  date_created?: string;
}

interface Card3Props {
  employee: { TargetQuota?: number | string } | null;
  filteredProgress: Progress[];
  startDate?: string;
  endDate?: string;
}

// Generate chart data
const generateChartData = (progress: Progress[], activeTab: "MTD" | "YTD") => {
  const dataMap: Record<string, number> = {};
  progress.forEach((p) => {
    if (!p.date_created) return;
    const d = new Date(p.date_created);
    const key = activeTab === "MTD" ? `${d.getDate()}/${d.getMonth() + 1}` : `${d.getMonth() + 1}/${d.getFullYear()}`;
    dataMap[key] = (dataMap[key] || 0) + (Number(p.actualsales) || 0);
  });
  return Object.entries(dataMap).map(([date, value]) => ({ date, value }));
};

const Card3: React.FC<Card3Props> = ({ employee, filteredProgress, startDate, endDate }) => {
  const [activeTab, setActiveTab] = useState<"MTD" | "YTD">("MTD");

  const today = endDate ? new Date(endDate) : new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const monthlyTarget = Number(employee?.TargetQuota) || 0;
  const target = activeTab === "YTD" ? monthlyTarget * 12 : monthlyTarget;

  const progressToUse = useMemo(() => {
    return filteredProgress.filter((p) => {
      if (!p.date_created) return false;
      const d = new Date(p.date_created);
      const start = startDate ? new Date(startDate + "T00:00:00") : new Date(-8640000000000000);
      const end = endDate ? new Date(endDate + "T23:59:59") : new Date(8640000000000000);
      return d >= start && d <= end;
    });
  }, [filteredProgress, startDate, endDate]);

  const totalActual = progressToUse.reduce((sum, record) => {
    if (activeTab === "MTD") {
      const d = new Date(record.date_created!);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        return sum + (Number(record.actualsales) || 0);
      }
      return sum;
    }
    return sum + (Number(record.actualsales) || 0);
  }, 0);

  const achievementPercent = target > 0 ? ((totalActual / target) * 100).toFixed(1) : "0";
  const percentToPlan = achievementPercent;
  const variance = target - totalActual;

  // Compute PAR
  const getWorkingDaysPassed = (year: number, month: number) => {
    const todayDate = endDate ? new Date(endDate) : new Date();
    const lastDay = activeTab === "MTD" ? todayDate.getDate() : new Date(year, 12, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 0) workingDays++; // Mon-Sat
    }
    return workingDays;
  };
  const getYTDWorkingDays = (year: number) => {
    const todayDate = endDate ? new Date(endDate) : new Date();
    let totalWorkingDays = 0;
    for (let month = 0; month <= todayDate.getMonth(); month++) {
      const daysInMonth = month === todayDate.getMonth() ? todayDate.getDate() : new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date.getDay() !== 0) totalWorkingDays++;
      }
    }
    return totalWorkingDays;
  };
  const workingDaysPassed = activeTab === "MTD"
    ? getWorkingDaysPassed(currentYear, currentMonth)
    : getYTDWorkingDays(currentYear);
  const fixedDays = activeTab === "MTD" ? 26 : 26 * 12;
  const parPercent = ((workingDaysPassed / fixedDays) * 100).toFixed(1);

  const chartData = generateChartData(progressToUse, activeTab);

  const formatCurrency = (num: number) =>
    `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  const stats = [
    { label: "Target Quota", value: formatCurrency(target), trend: IconTrendingUp },
    { label: "Actual Sales", value: formatCurrency(totalActual), trend: totalActual >= target ? IconTrendingUp : IconTrendingDown },
    { label: "Achievement", value: `${achievementPercent}%`, trend: Number(achievementPercent) >= 100 ? IconTrendingUp : IconTrendingDown },
    { label: "PAR", value: `${parPercent}%`, trend: parPercent >= "100" ? IconTrendingUp : IconTrendingDown },
    { label: "Variance", value: formatCurrency(variance), trend: variance < 0 ? IconTrendingDown : IconTrendingUp },
    { label: "% to Plan", value: `${percentToPlan}%`, trend: Number(percentToPlan) >= 100 ? IconTrendingUp : IconTrendingDown },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h4 className="text-md leading-none font-medium text-center">Sales Performance</h4>
        <p className="text-muted-foreground text-sm text-center">
          Track your daily and monthly sales progress here.
        </p>
      </div>

      <Separator className="my-2" />
      {/* Tabs with Separator */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "MTD" | "YTD")} className="w-[200px] mx-auto">
        <TabsList className="flex justify-center">
          <TabsTrigger value="MTD">MTD</TabsTrigger>
          <Separator orientation="vertical" className="h-6" />
          <TabsTrigger value="YTD">YTD</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {stats.map((s, idx) => {
          const TrendIcon = s.trend;
          return (
            <Card key={idx} className="p-4 rounded-xl shadow-sm relative text-center">
              <CardHeader>
                <div className="absolute top-4 right-4">
                  <Badge className="flex items-center gap-1" variant="outline">
                    <TrendIcon className="w-4 h-4" />
                  </Badge>
                </div>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold">{s.value}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card className="p-4 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Sales Progress</CardTitle>
          <CardDescription>{activeTab === "MTD" ? "Daily Sales" : "Monthly Sales"}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                {/* 🩶 Gray Gradient */}
                <linearGradient id="colorGray" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d1d5db" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: "10px" }} />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6b7280"
                fill="url(#colorGray)"
                name="Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Card3;
