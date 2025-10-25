"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";

interface TSA {
  _id: string;
  Firstname: string;
  Lastname: string;
  ReferenceID: string;
  profilePicture?: string;
  Status?: string;
}

interface SalesPerformanceProps {
  tsaList: TSA[];
  salesMap: Record<string, number>;
  loading: boolean;
  pesoFormatter: Intl.NumberFormat;
  handleViewTSA: (tsaId: string) => void;
}

const SalesPerformance: React.FC<SalesPerformanceProps> = ({
  tsaList,
  salesMap,
  loading,
  pesoFormatter,
  handleViewTSA,
}) => {
  const [animatedTotal, setAnimatedTotal] = useState<number>(0);
  const [animatedSalesMap, setAnimatedSalesMap] = useState<Record<string, number>>({});
  const [animatedRanks, setAnimatedRanks] = useState<Record<string, number>>({});
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🌀 Animate totals and ranks
  useEffect(() => {
    if (loading) {
      setAnimatedTotal(0);
      setAnimatedSalesMap({});
      setAnimatedRanks({});
      return;
    }

    const duration = 1000;
    const fps = 60;
    const stepTime = 1000 / fps;
    const totalSales = Object.values(salesMap).reduce((a, b) => a + b, 0);

    let currentTotal = 0;
    const totalStep = totalSales / (duration / stepTime);
    const totalInterval = window.setInterval(() => {
      currentTotal += totalStep;
      if (currentTotal >= totalSales) {
        currentTotal = totalSales;
        clearInterval(totalInterval);
      }
      setAnimatedTotal(currentTotal);
    }, stepTime);

    const agentIntervals: number[] = [];
    const sorted = Object.entries(salesMap)
      .sort((a, b) => b[1] - a[1])
      .map(([key, i]) => ({ key, rank: i + 1 }));

    Object.entries(salesMap).forEach(([key, value]) => {
      let current = 0;
      const step = value / (duration / stepTime);
      const interval = window.setInterval(() => {
        current += step;
        if (current >= value) {
          current = value;
          clearInterval(interval);
        }
        setAnimatedSalesMap((prev) => ({ ...prev, [key]: current }));
      }, stepTime);
      agentIntervals.push(interval);
    });

    const rankIntervals: number[] = [];
    sorted.forEach(({ key, rank }) => {
      let currentRank = 0;
      const step = rank / (duration / stepTime);
      const interval = window.setInterval(() => {
        currentRank += step;
        if (currentRank >= rank) {
          currentRank = rank;
          clearInterval(interval);
        }
        setAnimatedRanks((prev) => ({ ...prev, [key]: currentRank }));
      }, stepTime);
      rankIntervals.push(interval);
    });

    return () => {
      clearInterval(totalInterval);
      agentIntervals.forEach((i) => clearInterval(i));
      rankIntervals.forEach((i) => clearInterval(i));
    };
  }, [loading, salesMap]);

  // 🏆 Rank Icons
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

  // 🔁 Handle button click (show progress then redirect)
  const handleRedirect = (tsaId: string) => {
    setProgressVisible(true);
    setProgress(0);
    let current = 0;

    const interval = setInterval(() => {
      current += 5;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setProgressVisible(false);
        handleViewTSA(tsaId); // ✅ proceed to actual redirect
      }
    }, 100);
  };

  const rankedTSA = [...tsaList].sort(
    (a, b) => (salesMap[b.ReferenceID] || 0) - (salesMap[a.ReferenceID] || 0)
  );

  return (
    <div className="relative bg-white shadow-md rounded-lg p-6 overflow-hidden">
      {/* 🔄 Fullscreen Progress Overlay */}
      {progressVisible && (
        <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center z-50 transition">
          <h2 className="text-xl font-semibold mb-6 text-primary">
            Redirecting...
          </h2>
          <Progress value={progress} className="w-[80%] h-3 rounded-full bg-muted" />
          <p className="text-xs text-muted-foreground mt-3">
            Please wait while we open the employee form
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Territory Sales Associates</h2>
        <p className="text-sm text-gray-600">
          Total Sales:{" "}
          <span className="font-semibold">
            {loading ? "Fetching..." : pesoFormatter.format(animatedTotal)}
          </span>
        </p>
      </div>

      <Table>
        <TableCaption>A summary of TSA sales performance.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">Rank</TableHead>
            <TableHead>TSA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Sales</TableHead>
            <TableHead className="text-right w-[80px]">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tsaList.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No TSA found under this TSM.
              </TableCell>
            </TableRow>
          )}

          {rankedTSA.map((tsa) => {
            const rank = Math.round(animatedRanks[tsa.ReferenceID] || 0);
            const sales = animatedSalesMap[tsa.ReferenceID] || 0;

            return (
              <TableRow key={tsa._id} className="hover:bg-gray-50 cursor-pointer">
                <TableCell className="text-center text-lg">{getBadge(rank)}</TableCell>

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

                <TableCell className="text-gray-700">
                  {tsa.Status || "Active"}
                </TableCell>

                <TableCell className="text-right font-semibold">
                  {loading ? "..." : pesoFormatter.format(sales)}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRedirect(tsa._id)}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesPerformance;
