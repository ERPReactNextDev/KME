"use client";

import React, { useState } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface ProgressRecord {
  source?: string;
  callstatus?: string;
  companyname?: string;
  date_created?: string;
}

interface OutboundTouchbaseProps {
  filteredProgress: ProgressRecord[];
  progressLoading?: boolean;
}

const OutboundTouchbase: React.FC<OutboundTouchbaseProps> = ({
  filteredProgress,
  progressLoading,
}) => {
  const [showRecords, setShowRecords] = useState(false);

  const outboundRecords = filteredProgress
    .filter((p) => p.source?.toLowerCase() === "outbound - touchbase")
    .sort(
      (a, b) =>
        new Date(b.date_created || "").getTime() -
        new Date(a.date_created || "").getTime()
    );

  const successfulCount = outboundRecords.filter(
    (p) => p.callstatus?.toLowerCase() === "successful"
  ).length;

  const unsuccessfulCount = outboundRecords.filter(
    (p) => p.callstatus?.toLowerCase() === "unsuccessful"
  ).length;

  const totalCalls = outboundRecords.length;
  const successRate =
    totalCalls > 0 ? ((successfulCount / totalCalls) * 100).toFixed(1) : "0";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (progressLoading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (outboundRecords.length === 0) {
    return (
      <p className="italic text-gray-400 text-center">
        No Outbound - Touchbase records found.
      </p>
    );
  }

  // Prepare data for cards
  const cardData = [
    {
      title: "Successful Calls",
      value: successfulCount,
      trend: "+",
      icon: IconTrendingUp,
      description: "Successful calls this period",
    },
    {
      title: "Unsuccessful Calls",
      value: unsuccessfulCount,
      trend: "-",
      icon: IconTrendingDown,
      description: "Unsuccessful calls this period",
    },
    {
      title: "Total Calls",
      value: totalCalls,
      trend: "+",
      icon: IconTrendingUp,
      description: "All outbound touchbase calls",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      trend: `${successRate}%`,
      icon: IconTrendingUp,
      description: "Call success rate",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Cards */}
      <div className="space-y-1">
        <h4 className="text-md leading-none font-medium text-center">Outbound Calls - Touchbase</h4>
        <p className="text-muted-foreground text-sm text-center">
          Track and manage your outbound call activities to improve client engagement.
        </p>
      </div>

      <Separator className="my-2" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-2">
        {cardData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="p-4 rounded-xl shadow-sm">
              <CardHeader className="flex flex-col gap-2 relative">
                {/* Badge positioned top right */}
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Icon className="w-4 h-4" /> {card.title === "Success Rate" ? card.trend : card.trend}
                  </Badge>
                </div>

                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-2xl font-semibold capitalize tabular-nums">
                  {card.value}
                </CardTitle>
              </CardHeader>

              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium capitalize">
                  {card.description} <Icon className="w-4 h-4" />
                </div>
              </CardFooter>
            </Card>

          );
        })}
      </div>

      {/* View Records Button */}
      <div className="text-center mt-2">
        <button
          onClick={() => setShowRecords(!showRecords)}
          className="px-4 py-2 rounded-lg text-sm shadow-md border hover:bg-gray-100 transition"
        >
          {showRecords ? "Hide Records" : "View Records"}
        </button>
      </div>

      {/* Table of Records */}
      {showRecords && (
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableCaption>Recent Outbound - Touchbase Records</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outboundRecords.slice(0, 20).map((record, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium uppercase">
                    {record.companyname || "N/A"}
                  </TableCell>
                  <TableCell
                    className={
                      record.callstatus?.toLowerCase() === "successful"
                        ? "text-green-600"
                        : record.callstatus?.toLowerCase() === "unsuccessful"
                          ? "text-red-600"
                          : "text-gray-500"
                    }
                  >
                    {record.callstatus || "No Status"}
                  </TableCell>
                  <TableCell>{formatDate(record.date_created)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total Records</TableCell>
                <TableCell>{outboundRecords.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
};

export default OutboundTouchbase;
