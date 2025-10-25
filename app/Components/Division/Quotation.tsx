"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CallRecord {
  quotationnumber?: string;
  quotationamount?: number | string;
  activitystatus?: string;
  startdate?: string | null;
  enddate?: string | null;
  actualsales?: number | string;
  soamount?: number | string;
}

interface Card9Props {
  filteredProgress: CallRecord[];
  dateRange: { start: string; end: string };
}

const Card9: React.FC<Card9Props> = ({ filteredProgress, dateRange }) => {
  // 🔹 Quote-Done Records
  const quoteDoneRecords = useMemo(
    () =>
      filteredProgress.filter(
        (rec) => (rec.activitystatus || "").trim().toLowerCase() === "quote-done"
      ),
    [filteredProgress]
  );

  const totalQuoteCount = quoteDoneRecords.length;

  const totalQuoteAmount = useMemo(() => {
    return quoteDoneRecords.reduce(
      (sum, rec) => sum + (Number(rec.quotationamount) || 0),
      0
    );
  }, [quoteDoneRecords]);

  // 🔹 SO-Done Records
  const soRecords = useMemo(() => {
    const filtered = filteredProgress.filter(
      (rec) => (rec.activitystatus || "").trim().toLowerCase() === "so-done"
    );
    const totalSOAmount = filtered.reduce(
      (sum, rec) => sum + (Number(rec.soamount) || 0),
      0
    );
    return {
      quantity: filtered.length,
      totalSOAmount,
    };
  }, [filteredProgress]);

  // 🔹 Delivered (Actual Sales)
  const deliveredRecords = useMemo(
    () =>
      filteredProgress.filter(
        (rec) =>
          (rec.activitystatus || "").toLowerCase() === "delivered" &&
          (Number(rec.actualsales) || 0) > 0
      ),
    [filteredProgress]
  );

  const totalDeliveredSales = useMemo(() => {
    return deliveredRecords.reduce(
      (sum, rec) => sum + (Number(rec.actualsales) || 0),
      0
    );
  }, [deliveredRecords]);

  // 🔹 Conversion Rates
  const quoteToSOPercent =
    totalQuoteCount > 0 ? (soRecords.quantity / totalQuoteCount) * 100 : 0;
  const quoteToSIPercent =
    totalQuoteAmount > 0 ? (totalDeliveredSales / totalQuoteAmount) * 100 : 0;

  // 🔹 Handling Time
  const handlingTimeMs = useMemo(() => {
    let totalMs = 0;
    quoteDoneRecords.forEach((rec) => {
      const start = rec.startdate ? new Date(rec.startdate) : null;
      const end = rec.enddate ? new Date(rec.enddate) : null;
      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        totalMs += end.getTime() - start.getTime();
      }
    });
    return totalMs;
  }, [quoteDoneRecords]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // 🔹 Stats List
  const stats = [
    { label: "Total Quote", value: totalQuoteCount, description: "Total number of quotations created" },
    { label: "Total Quote Amount", value: `₱${totalQuoteAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, description: "Total quotation value in pesos" },
    { label: "Handling Time", value: formatDuration(handlingTimeMs), description: "Total handling duration between start and end" },
    { label: "Quote → SO (Qty)", value: soRecords.quantity, description: "Number of quotes converted to SO" },
    { label: "Quote → SO (₱)", value: `₱${soRecords.totalSOAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, description: "Total SO amount converted from quotations" },
    { label: "Quote → SO Conversion", value: `${quoteToSOPercent.toFixed(2)}%`, description: "Conversion rate from quotation count to SO" },
    { label: "Quotation → SI Conversion", value: `${quoteToSIPercent.toFixed(2)}%`, description: "Conversion rate from quotation value to delivered SI" },
  ];

  return (
    <Card className="p-6 rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="space-y-1 mb-4 text-center sm:text-left">
        <h4 className="text-md leading-none font-medium">Quotation Summary</h4>
        <p className="text-muted-foreground text-sm">
          Overview of quotation performance, conversions, and handling time.
        </p>
      </div>

      <Separator className="my-2" />

      {/* Stats */}
      <CardContent className="flex flex-col gap-4">
        {totalQuoteCount === 0 ? (
          <p className="text-gray-500 text-center text-sm">No Quote-Done records found.</p>
        ) : (
          stats.map((s, idx) => (
            <div key={idx} className="flex justify-between items-center border-b last:border-b-0 pb-2">
              <div className="flex-1">
                <CardDescription>{s.label}</CardDescription>
                <span className="text-xs text-muted-foreground">{s.description}</span>
              </div>
              <Separator orientation="vertical" className="h-6 mx-4 hidden sm:block" />
              <CardTitle className="text-2xl font-semibold">{s.value}</CardTitle>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default Card9;
