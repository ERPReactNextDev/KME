"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Progress {
  typeactivity?: string;
  startdate?: string;
  enddate?: string;
}

interface Card11Props {
  filteredProgress: Progress[];
  dateRange: { start: string; end: string };
}

const Card11: React.FC<Card11Props> = ({ filteredProgress }) => {
  // 🔹 Compute total duration per activity type
  const activitySummary = useMemo(() => {
    const summary: Record<string, number> = {};

    filteredProgress.forEach((rec) => {
      if (!rec.typeactivity || !rec.startdate || !rec.enddate) return;
      const start = new Date(rec.startdate);
      const end = new Date(rec.enddate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return;

      const duration = end.getTime() - start.getTime();
      summary[rec.typeactivity] = (summary[rec.typeactivity] || 0) + duration;
    });

    return summary;
  }, [filteredProgress]);

  // 🔹 Format duration (HH:MM:SS)
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const activityTypes = Object.keys(activitySummary);

  // 🔹 Total duration across all activities
  const totalDuration = Object.values(activitySummary).reduce(
    (sum, ms) => sum + ms,
    0
  );

  return (
    <Card className="p-6 rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="space-y-1 mb-4 text-center sm:text-center mt-4">
        <h4 className="text-md leading-none font-medium">Activity Summary</h4>
        <p className="text-muted-foreground text-sm">
          Summary of employee activity durations based on start and end times.
        </p>
      </div>

      <Separator className="my-2" />

      {/* Content */}
      <CardContent className="flex flex-col gap-3">
        {activityTypes.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">
            No valid activities found for the selected date range.
          </p>
        ) : (
          <>
            {/* 🔸 Total Duration Row */}
            <div className="flex flex-row justify-between items-center border-b pb-2">
              <CardDescription className="font-medium">Total Duration</CardDescription>
              <CardTitle className="text-lg font-semibold">
                {formatDuration(totalDuration)}
              </CardTitle>
            </div>

            {/* 🔸 Individual Activities */}
            {activityTypes.map((type, idx) => (
              <div
                key={idx}
                className="flex flex-row justify-between items-center border-b last:border-b-0 pb-2"
              >
                <CardDescription>{type}</CardDescription>
                <CardTitle className="text-lg font-semibold">
                  {formatDuration(activitySummary[type])}
                </CardTitle>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Card11;
