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
  activitystatus?: string;
  soamount?: number | string;
  actualsales?: number | string;
  startdate?: string;
  enddate?: string;
}

interface Card10Props {
  filteredProgress: CallRecord[];
  dateRange: { start: string; end: string };
}

const Card10: React.FC<Card10Props> = ({ filteredProgress }) => {
  // ✅ Filter SO-Done records
  const soDoneRecords = useMemo(() => {
    return filteredProgress.filter(
      (rec) => (rec.activitystatus || "").trim().toLowerCase() === "so-done"
    );
  }, [filteredProgress]);

  const totalSOCount = soDoneRecords.length;
  const totalSOAmount = useMemo(() => {
    return soDoneRecords.reduce(
      (sum, rec) => sum + (Number(rec.soamount) || 0),
      0
    );
  }, [soDoneRecords]);

  // ✅ Delivered / Actual Sales
  const deliveredRecords = useMemo(() => {
    return filteredProgress.filter(
      (rec) =>
        (rec.activitystatus || "").toLowerCase() === "delivered" &&
        (Number(rec.actualsales) || 0) > 0
    );
  }, [filteredProgress]);

  const totalDeliveredSales = useMemo(() => {
    return deliveredRecords.reduce(
      (sum, rec) => sum + (Number(rec.actualsales) || 0),
      0
    );
  }, [deliveredRecords]);

  // ✅ SO → SI conversion %
  const soToSIPercent =
    totalSOAmount > 0 ? (totalDeliveredSales / totalSOAmount) * 100 : 0;

  // ✅ Handling time (optional)
  const handlingTimeMs = useMemo(() => {
    let totalMs = 0;
    soDoneRecords.forEach((rec) => {
      try {
        const start = new Date(rec.startdate || "");
        const end = new Date(rec.enddate || "");
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
          totalMs += end.getTime() - start.getTime();
        }
      } catch {}
    });
    return totalMs;
  }, [soDoneRecords]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const stats = [
    { label: "Total SO", value: totalSOCount, description: "Total Sales Orders completed" },
    { label: "Total SO Amount", value: `₱${totalSOAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, description: "Total peso value of Sales Orders" },
    { label: "SO to SI Conversion (Qty)", value: deliveredRecords.length, description: "Delivered count converted from SO" },
    { label: "SO to SI Conversion (Peso)", value: `₱${totalDeliveredSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, description: "Delivered peso value converted from SO" },
    { label: "SO → SI Conversion (%)", value: `${soToSIPercent.toFixed(2)}%`, description: "Conversion rate of SO to Sales Invoice" },
    // { label: "Handling Time", value: formatDuration(handlingTimeMs), description: "Average SO processing duration" }, // optional
  ];

  return (
    <Card className="p-6 rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="space-y-1 mb-4 text-center sm:text-left">
        <h4 className="text-md leading-none font-medium">Sales Orders Summary</h4>
        <p className="text-muted-foreground text-sm">
          Overview of Sales Orders and their conversion into Sales Invoices.
        </p>
      </div>

      <Separator className="my-2" />

      {/* Stats */}
      <CardContent className="flex flex-col gap-4">
        {totalSOCount === 0 ? (
          <p className="text-gray-500 text-center text-sm">No SO-Done records found.</p>
        ) : (
          stats.map((s, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border-b last:border-b-0 pb-2"
            >
              <div className="flex-1">
                <CardDescription>{s.label}</CardDescription>
                <span className="text-xs text-muted-foreground">
                  {s.description}
                </span>
              </div>
              <Separator orientation="vertical" className="h-6 mx-4 hidden sm:block" />
              <CardTitle className="text-2xl font-semibold text-black">{s.value}</CardTitle>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default Card10;
