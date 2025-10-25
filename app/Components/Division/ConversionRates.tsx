"use client";

import React, { useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CallsToQuote from "./Section/CallstoQuote";
import QuoteToSO from "./Section/QuotetoSO";
import SOtoSI from "./Section/SoToSI";
import CallsToSi from "./Section/CallsToSi";

interface Progress {
  activitystatus?: string;
  source?: string;
  date_created?: string;
}

interface Card4Props {
  filteredProgress: Progress[];
  startDate?: string;
  endDate?: string;
}

const Card4: React.FC<Card4Props> = ({ filteredProgress, startDate, endDate }) => {
  const [activeTab, setActiveTab] = useState<"MTD" | "YTD">("MTD");

  const today = endDate ? new Date(endDate) : new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Filter progress based on parent date range
  const progressToUse = useMemo(() => {
    return filteredProgress.filter((p) => {
      if (!p.date_created) return false;
      const d = new Date(p.date_created);

      const start = startDate ? new Date(startDate + "T00:00:00") : new Date(-8640000000000000);
      const end = endDate ? new Date(endDate + "T23:59:59") : new Date(8640000000000000);

      return d >= start && d <= end;
    });
  }, [filteredProgress, startDate, endDate]);

  // Further filter for MTD/YTD
  const progressForTab = useMemo(() => {
    return progressToUse.filter((p) => {
      const d = new Date(p.date_created!);
      if (activeTab === "MTD") return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      return d.getFullYear() === currentYear; // YTD
    });
  }, [progressToUse, activeTab, currentYear, currentMonth]);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h4 className="text-md leading-none font-medium text-center">Conversion Rates</h4>
        <p className="text-muted-foreground text-sm text-center">
          Track your daily and monthly sales progress here.
        </p>
      </div>

      <Separator className="my-2" />

      {/* Tab Switch */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "MTD" | "YTD")} className="w-[200px] mx-auto">
        <TabsList className="flex justify-center">
          <TabsTrigger value="MTD">MTD</TabsTrigger>
          <Separator orientation="vertical" className="h-6" />
          <TabsTrigger value="YTD">YTD</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <CallsToQuote filteredProgress={progressForTab} />
        <QuoteToSO filteredProgress={progressForTab} />
        <SOtoSI filteredProgress={progressForTab} />
        <CallsToSi filteredProgress={progressForTab} />
      </div>
    </div>
  );
};

export default Card4;
