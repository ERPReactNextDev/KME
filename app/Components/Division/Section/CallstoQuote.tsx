"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Progress {
  activitystatus?: string;
  source?: string;
  date_created?: string;
}

interface CallsToQuoteProps {
  filteredProgress: Progress[];
}

const CallsToQuote: React.FC<CallsToQuoteProps> = ({ filteredProgress }) => {
  const totalCalls = useMemo(
    () => filteredProgress.filter((p) => p.source === "Outbound - Touchbase").length,
    [filteredProgress]
  );

  const totalQuotes = useMemo(
    () => filteredProgress.filter((p) => p.activitystatus === "Quote-Done").length,
    [filteredProgress]
  );

  const conversionRate = totalCalls > 0 ? ((totalQuotes / totalCalls) * 100).toFixed(1) : "0";

  const stats = [
    { label: "# of Calls", value: totalCalls, description: "Total outbound touchbase calls made" },
    { label: "# of Quotes", value: totalQuotes, description: "Number of calls that converted to quotes" },
    { label: "% Calls to Quote", value: `${conversionRate}%`, description: "Conversion rate from calls to quotes" },
  ];

  return (
    <Card className="p-6 rounded-2xl border border-gray-200">
      {/* Header / Description */}
      <div className="space-y-1 mb-4">
        <h4 className="text-md leading-none font-medium text-center sm:text-left">Calls to Quote</h4>
        <p className="text-muted-foreground text-sm text-center sm:text-left">
          Overview of outbound touchbase calls and their conversion performance.
        </p>
      </div>

      <Separator className="my-2" />

      {/* Stats */}
      <CardContent className="flex flex-col sm:flex-col gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="flex flex-row sm:flex-row justify-between items-center border-b last:border-b-0 pb-2">
            <div className="flex-1">
              <CardDescription>{s.label}</CardDescription>
              <span className="text-xs text-muted-foreground">{s.description}</span>
            </div>
            <Separator orientation="vertical" className="h-6 mx-4 hidden sm:block" />
            <CardTitle className="text-2xl font-semibold">{s.value}</CardTitle>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CallsToQuote;
