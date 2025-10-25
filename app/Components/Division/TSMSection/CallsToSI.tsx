"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

interface TSA {
  _id: string;
  Firstname: string;
  Lastname: string;
  ReferenceID: string;
  profilePicture?: string;
}

interface Progress {
  referenceid: string;
  source?: string;
  activitystatus?: string;
}

interface CallsToSIProps {
  filteredProgress: Progress[];
  tsaList: TSA[];
  loading: boolean;
}

const CallsToSI: React.FC<CallsToSIProps> = ({
  filteredProgress,
  tsaList,
  loading,
}) => {
  // 🧮 Compute per-TSA stats
  const perTsaStats = useMemo(() => {
    return tsaList.map((tsa) => {
      const calls = filteredProgress.filter(
        (r) =>
          r.referenceid === tsa.ReferenceID &&
          r.source === "Outbound - Touchbase"
      ).length;

      const si = filteredProgress.filter(
        (r) =>
          r.referenceid === tsa.ReferenceID &&
          r.activitystatus === "Delivered"
      ).length;

      const conversionRate = calls > 0 ? ((si / calls) * 100).toFixed(1) : "0";

      return { tsa, calls, si, conversionRate };
    });
  }, [tsaList, filteredProgress]);

  // 🏆 Sort by highest conversion rate
  const rankedTSA = [...perTsaStats].sort(
    (a, b) => Number(b.conversionRate) - Number(a.conversionRate)
  );

  // 📊 Totals
  const totalCalls = filteredProgress.filter(
    (r) => r.source === "Outbound - Touchbase"
  ).length;
  const totalSI = filteredProgress.filter(
    (r) => r.activitystatus === "Delivered"
  ).length;
  const totalConversion =
    totalCalls > 0 ? ((totalSI / totalCalls) * 100).toFixed(1) : "0";

  // 🥇 Rank badge
  const getBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "🏆";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "⭐";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* 🧭 Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Calls to SI</h2>
      </div>

      {/* 📈 Totals Summary */}
      <div className="grid grid-cols-3 text-center mb-4">
        <div>
          <p className="text-sm text-gray-600 font-medium">Total Calls</p>
          <p className="text-xl font-bold text-blue-600">{totalCalls}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Total SI</p>
          <p className="text-xl font-bold text-green-600">{totalSI}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Conversion %</p>
          <p className="text-xl font-bold text-purple-600">{totalConversion}%</p>
        </div>
      </div>

      {/* 🧾 Table */}
      <Table>
        <TableCaption>Calls to SI performance by TSA.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">Rank</TableHead>
            <TableHead>TSA</TableHead>
            <TableHead className="text-right">Calls</TableHead>
            <TableHead className="text-right">SI</TableHead>
            <TableHead className="text-right">Conversion %</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                Fetching data...
              </TableCell>
            </TableRow>
          ) : rankedTSA.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No TSA data found.
              </TableCell>
            </TableRow>
          ) : (
            rankedTSA.map(({ tsa, calls, si, conversionRate }, index) => (
              <TableRow key={tsa._id} className="hover:bg-gray-50 cursor-pointer">
                <TableCell className="text-center text-lg">
                  {getBadge(index + 1)}
                </TableCell>

                <TableCell>
                  <Item>
                    <ItemMedia>
                      <Avatar>
                        <AvatarImage
                          src={tsa.profilePicture || ""}
                          alt={`${tsa.Firstname} ${tsa.Lastname}`}
                        />
                        <AvatarFallback>
                          {tsa.Firstname?.[0]}
                          {tsa.Lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="capitalize font-medium">
                        {tsa.Firstname} {tsa.Lastname}
                      </ItemTitle>
                      <ItemDescription className="text-xs text-muted-foreground">
                        ID: {tsa.ReferenceID}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </TableCell>

                <TableCell className="text-right">{calls}</TableCell>
                <TableCell className="text-right">{si}</TableCell>
                <TableCell className="text-right font-semibold">
                  {conversionRate}%
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CallsToSI;
