"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CallRecord {
  quotationnumber?: string;
  activitystatus?: string;
  actualsales?: number | string;
  source?: string;
  typeactivity?: string;
}

interface Card8Props {
  filteredProgress: CallRecord[];
  dateRange: { start: string; end: string };
}

const Card8: React.FC<Card8Props> = ({ filteredProgress, dateRange }) => {
  const getWorkingDaysCount = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) count++; // Exclude Sundays
    }
    return count;
  };

  const workingDays = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return 0;
    return getWorkingDaysCount(dateRange.start, dateRange.end);
  }, [dateRange]);

  const totalActualSales = useMemo(() => {
    return filteredProgress.reduce((sum, call) => {
      const value = Number(call.actualsales);
      return isNaN(value) ? sum : sum + value;
    }, 0);
  }, [filteredProgress]);

  const totalQuotations = useMemo(() => {
    return filteredProgress.reduce((count, call) => {
      const value = (call.quotationnumber || "").toString().trim().toLowerCase();
      if (!["n/a", "none", "na", "n.a", "n.a.", "", null, undefined].includes(value)) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [filteredProgress]);

  const totalDelivered = useMemo(() => {
    return filteredProgress.reduce((count, call) => {
      if ((call.activitystatus || "").toLowerCase() === "delivered") {
        return count + 1;
      }
      return count;
    }, 0);
  }, [filteredProgress]);

  const outboundData = useMemo(() => {
    const filtered = filteredProgress.filter(
      (p) =>
        p.source?.toLowerCase() === "outbound - touchbase" &&
        p.typeactivity?.toLowerCase() === "outbound calls"
    );
    const totalOB = filtered.length;
    const obTarget = 35 * workingDays;
    const achievement = obTarget > 0 ? (totalOB / obTarget) * 100 : 0;
    const callsToQuoteConversion = totalOB > 0 ? (totalQuotations / totalOB) * 100 : 0;
    const outboundToSalesConversion = totalOB > 0 ? (totalDelivered / totalOB) * 100 : 0;

    return {
      totalOB,
      obTarget,
      achievement,
      callsToQuoteConversion,
      outboundToSalesConversion,
      totalActualSales,
    };
  }, [filteredProgress, workingDays, totalQuotations, totalDelivered, totalActualSales]);

  const stats = [
    { label: "OB Target", value: outboundData.obTarget, description: "Planned outbound calls target"},
    { label: "Total OB", value: outboundData.totalOB, description: "Total outbound calls made" },
    { label: "OB Achievement", value: `${outboundData.achievement.toFixed(2)}%`, description: "Achievement vs target"},
    { label: "Calls to Quote Conversion", value: `${outboundData.callsToQuoteConversion.toFixed(2)}%`, description: "Conversion from calls to quotes"},
    { label: "Outbound to Sales Conversion", value: `${outboundData.outboundToSalesConversion.toFixed(2)}%`, description: "Conversion from calls to delivered sales"},
    { label: "Actual Sales", value: `₱${outboundData.totalActualSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, description: "Total actual sales achieved"},
  ];

  return (
    <Card className="p-6 rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="space-y-1 mb-4 text-center sm:text-left">
        <h4 className="text-md leading-none font-medium">Outbound Calls Summary</h4>
        <p className="text-muted-foreground text-sm">
          Overview of outbound calls, targets, conversions, and sales.
        </p>
      </div>

      <Separator className="my-2" />

      {/* Stats */}
      <CardContent className="flex flex-col gap-4">
        {outboundData.totalOB === 0 ? (
          <p className="text-gray-500 text-center text-sm">No Outbound Calls found.</p>
        ) : (
          stats.map((s, idx) => (
            <div key={idx} className="flex justify-between items-center border-b last:border-b-0 pb-2">
              <div className="flex-1">
                <CardDescription>{s.label}</CardDescription>
                <span className="text-xs text-muted-foreground">{s.description}</span>
              </div>
              <Separator orientation="vertical" className="h-6 mx-4 hidden sm:block" />
              <CardTitle className={`text-2xl font-semibold`}>{s.value}</CardTitle>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default Card8;
