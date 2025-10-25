"use client";

import React, { useMemo } from "react";

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
}

const CallsToSI: React.FC<CallsToSIProps> = ({ filteredProgress, tsaList }) => {
  // Compute per-TSA stats
  const perTsaStats = useMemo(() => {
    return tsaList
      .map((tsa) => {
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
      })
      .sort((a, b) => Number(b.conversionRate) - Number(a.conversionRate));
  }, [tsaList, filteredProgress]);

  // Totals
  const totals = useMemo(() => {
    const totalCalls = perTsaStats.reduce((sum, t) => sum + t.calls, 0);
    const totalSI = perTsaStats.reduce((sum, t) => sum + t.si, 0);
    const conversionRate =
      totalCalls > 0 ? ((totalSI / totalCalls) * 100).toFixed(1) : "0";
    return { totalCalls, totalSI, conversionRate };
  }, [perTsaStats]);

  // Badge for ranking
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
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Calls to SI
      </h2>

      {/* Totals Section */}
      <div className="flex justify-around mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium"># of Calls</p>
          <p className="text-2xl font-bold text-blue-600">
            {totals.totalCalls}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium"># of SI</p>
          <p className="text-2xl font-bold text-green-600">
            {totals.totalSI}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">% Calls to SI</p>
          <p className="text-2xl font-bold text-purple-600">
            {totals.conversionRate}%
          </p>
        </div>
      </div>

      {/* TSA Ranking */}
      <h3 className="text-md font-semibold mb-2">
        TSAs Ranked by Calls to SI Conversion
      </h3>
      <ul className="space-y-2">
        {perTsaStats.map(({ tsa, calls, si, conversionRate }, index) => (
          <li
            key={tsa._id}
            className="flex items-center justify-between border-b py-2 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center space-x-3">
              {/* Rank Badge */}
              <span className="text-lg animate-bounce">{getBadge(index + 1)}</span>

              {/* Profile Picture */}
              {tsa.profilePicture ? (
                <img
                  src={tsa.profilePicture}
                  alt={`${tsa.Firstname} ${tsa.Lastname}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium capitalize">
                  {tsa.Firstname?.[0]}
                  {tsa.Lastname?.[0]}
                </div>
              )}

              {/* TSA Info */}
              <div className="flex flex-col">
                <span className="text-gray-800 capitalize font-medium">
                  {tsa.Firstname} {tsa.Lastname}
                </span>
                <span className="text-sm text-gray-600">
                  Calls: <span className="font-semibold">{calls}</span> | SI:{" "}
                  <span className="font-semibold">{si}</span> | Conversion:{" "}
                  <span className="font-semibold">{conversionRate}%</span>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CallsToSI;
