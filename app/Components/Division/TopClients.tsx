"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Progress {
  companyname?: string;
  typeclient?: string;
  actualsales?: string | number;
  date_created?: string;
}

interface Card6Props {
  filteredProgress: Progress[];
}

const chartConfig = {
  desktop: {
    label: "Sales",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const Card6: React.FC<Card6Props> = ({ filteredProgress }) => {
  // Aggregate sales per company
  const allCompanies = useMemo(() => {
    const companyMap: Record<string, { companyname: string; typeclient?: string; totalSales: number }> = {};

    filteredProgress.forEach((p) => {
      const name = p.companyname || "Unknown";
      const sales = Number(p.actualsales) || 0; // Ensure numeric conversion

      if (!companyMap[name]) {
        companyMap[name] = { companyname: name, typeclient: p.typeclient, totalSales: sales };
      } else {
        companyMap[name].totalSales += sales;
      }
    });

    return Object.values(companyMap)
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredProgress]);

  const topCompanies = allCompanies.slice(0, 5);

  const chartData = topCompanies.map((c) => ({
    company: c.companyname,
    sales: c.totalSales,
    color: "#000000", // all bars black
  }));

  const formatCurrency = (num: number) =>
    `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    <Card>
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle>Top 5 Companies</CardTitle>
          <CardDescription>By actual sales</CardDescription>
        </div>

        {/* View All Rank Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              View All Rank
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Company Rankings</DialogTitle>
            </DialogHeader>

            <div className="overflow-x-auto mt-4">
              <Table>
                <TableCaption>All companies by actual sales</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCompanies.map((c, idx) => (
                    <TableRow key={c.companyname + idx}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell className="uppercase">{c.companyname}</TableCell>
                      <TableCell>{c.typeclient || "N/A"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.totalSales)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500">No data available</p>
        ) : (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="company" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="sales">
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="sales"
                    position="top"
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>

      {chartData.length > 0 && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Trending up <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing top 5 companies by sales
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default Card6;
