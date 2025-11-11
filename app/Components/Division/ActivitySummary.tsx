"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Progress {
  typeactivity?: string;
  startdate?: string;
  enddate?: string;
  companyname: string;
}

interface Card11Props {
  filteredProgress: Progress[];
  dateRange: { start: string; end: string };
}

const Card11: React.FC<Card11Props> = ({ filteredProgress }) => {
  // Compute total duration and unique companies per activity type
  const activitySummary = useMemo(() => {
    type ActivityData = {
      duration: number;
      companies: Set<string>;
    };

    const summary: Record<string, ActivityData> = {};

    filteredProgress.forEach((rec) => {
      if (!rec.typeactivity || !rec.startdate || !rec.enddate) return;
      const start = new Date(rec.startdate);
      const end = new Date(rec.enddate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start)
        return;

      const duration = end.getTime() - start.getTime();
      const type = rec.typeactivity;
      const company = rec.companyname;

      if (!summary[type]) {
        summary[type] = { duration: 0, companies: new Set() };
      }
      summary[type].duration += duration;
      summary[type].companies.add(company);
    });

    return summary;
  }, [filteredProgress]);

  // Format milliseconds to HH:MM:SS
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const activityTypes = Object.keys(activitySummary);

  // Total duration overall
  const totalDuration = activityTypes.reduce(
    (sum, type) => sum + activitySummary[type].duration,
    0
  );

  // Total unique companies overall
  const totalCompanies = new Set<string>();
  activityTypes.forEach((type) => {
    activitySummary[type].companies.forEach((c) => totalCompanies.add(c));
  });

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
            {/* Total Duration & Companies */}
            <div className="flex flex-row justify-between items-center border-b pb-2">
              <CardDescription className="font-medium">Total Duration</CardDescription>
              <CardTitle className="text-lg font-semibold">
                {formatDuration(totalDuration)}
              </CardTitle>
            </div>
            <div className="flex flex-row justify-between items-center border-b pb-4">
              <CardDescription className="font-medium">Total Companies</CardDescription>
              <CardTitle className="text-lg font-semibold">{totalCompanies.size}</CardTitle>
            </div>

            {/* Activities with Accordion for company names */}
            <Accordion type="multiple" className="w-full">
              {activityTypes.map((type) => (
                <AccordionItem key={type} value={type}>
                  <AccordionTrigger className="flex justify-between items-center">
                    <span>{type}</span>
                    <span className="font-semibold">
                      {formatDuration(activitySummary[type].duration)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-muted-foreground mt-2">
                      <p className="mb-1 font-medium">
                        Companies ({activitySummary[type].companies.size}):
                      </p>
                      <ul className="list-disc list-inside max-h-40 overflow-auto">
                        {[...activitySummary[type].companies].map((company) => (
                          <li key={company}>{company}</li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Card11;
