"use client";

import React from "react";
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

interface CallRecord {
  referenceid: string;
  callstatus: string;
  source: string;
}

interface Props {
  tsaList: TSA[];
  callRecords: CallRecord[];
  loading: boolean;
}

const OutboundCallTouchbase: React.FC<Props> = ({ tsaList, callRecords, loading }) => {
  // ✅ Count successful outbound calls per TSA
  const callMap: Record<string, number> = {};
  tsaList.forEach((tsa) => {
    callMap[tsa.ReferenceID] = callRecords.filter(
      (c) =>
        c.referenceid === tsa.ReferenceID &&
        c.callstatus === "Successful" &&
        c.source === "Outbound - Touchbase"
    ).length;
  });

  // 🏆 Rank TSA by successful calls
  const rankedTSA = [...tsaList].sort(
    (a, b) => (callMap[b.ReferenceID] || 0) - (callMap[a.ReferenceID] || 0)
  );

  // 🎖️ Rank icons
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
        <h2 className="text-lg font-bold">Outbound Touchbase Calls</h2>
        <p className="text-sm text-gray-600">
          Total Successful Calls:{" "}
          <span className="font-semibold">
            {tsaList.reduce((a, b) => a + (callMap[b.ReferenceID] || 0), 0)}
          </span>
        </p>
      </div>

      {/* 📊 Table */}
      <Table>
        <TableCaption>A summary of outbound successful touchbase calls.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">Rank</TableHead>
            <TableHead>TSA</TableHead>
            <TableHead className="text-right">Successful Calls</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                Fetching data...
              </TableCell>
            </TableRow>
          ) : tsaList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                No TSA found under this TSM.
              </TableCell>
            </TableRow>
          ) : (
            rankedTSA.map((tsa, index) => (
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

                <TableCell className="text-right font-semibold">
                  {callMap[tsa.ReferenceID] || 0}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OutboundCallTouchbase;
