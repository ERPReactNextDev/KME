"use client";

import React, { useMemo } from "react";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Progress {
  activitystatus?: string;
  source?: string;
  date_created?: string;
}

interface QuoteToSOProps {
  filteredProgress: Progress[];
}

const QuoteToSO: React.FC<QuoteToSOProps> = ({ filteredProgress }) => {
  const totalQuotes = useMemo(
    () => filteredProgress.filter((p) => p.activitystatus === "Quote-Done").length,
    [filteredProgress]
  );

  const totalSO = useMemo(
    () => filteredProgress.filter((p) => p.activitystatus === "SO-Done").length,
    [filteredProgress]
  );

  const conversionRate = totalQuotes > 0 ? ((totalSO / totalQuotes) * 100).toFixed(1) : "0";

  const stats = [
    { label: "# of Quotes", value: totalQuotes, description: "Number of completed quotes" },
    { label: "# of SO", value: totalSO, description: "Number of quotes converted to Sales Orders" },
    { label: "% Quote to SO", value: `${conversionRate}%`, description: "Conversion rate from quotes to SO" },
  ];

  return (
    <Card className="p-6 rounded-2xl border border-gray-200">
      {/* Header / Description */}
      <div className="space-y-1 mb-4">
        <h4 className="text-md leading-none font-medium text-center sm:text-left">Quote to SO</h4>
        <p className="text-muted-foreground text-sm text-center sm:text-left">
          Overview of quotes and their conversion into Sales Orders.
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

export default QuoteToSO;
