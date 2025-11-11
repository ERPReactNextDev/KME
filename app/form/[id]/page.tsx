"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// Breadcrumbs
import Breadcrumbs from "../../Components/Tool/Breadcrumbs";
// Daterange
import DateRange from "../../Components/Tool/DateRange";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
// Employee Info Cards
import Card1 from "../../Components/Division/EmployeeInfo";
import Card13 from "../../Components/Division/EmployeeLogs";
// TSA Cards
import Card2 from "../../Components/Division/OutboundTouchbase";
import Card3 from "../../Components/Division/SalesPerformance";
import Card4 from "../../Components/Division/ConversionRates";
import Card5 from "../../Components/Division/SourceBreakdown";
import Card6 from "../../Components/Division/TopClients";
import Card7 from "../../Components/Division/CSRMetrics";
import Card8 from "../../Components/Division/OutboundCalls";
import Card9 from "../../Components/Division/Quotation";
import Card10 from "../../Components/Division/SOSummary";
// Employee Activity
import Card11 from "../../Components/Division/ActivitySummary";
// TSM Dashboard
import Card12 from "../../Components/Division/TSMDashboard";

interface User {
  _id: string;
  Firstname?: string;
  Lastname?: string;
  Role?: string;
  ReferenceID?: string;
  [key: string]: any;
}

interface Progress {
  id?: number;
  referenceid: string;
  typeactivity?: string;
  companyname: string;
  startdate?: string;
  enddate?: string;
  date_created?: string;
  [key: string]: any;
}

const EmployeeFormPage = () => {
  const params = useParams();
  const id = (params as { id: string }).id;

  const [employee, setEmployee] = useState<User | null>(null);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch employee
  useEffect(() => {
    if (!id) return;
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/users?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch employee");
        const data = await res.json();
        setEmployee(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  // Fetch progress
  useEffect(() => {
    if (!employee?.ReferenceID) return;

    const fetchProgress = async () => {
      setProgressLoading(true);
      try {
        const res = await fetch(`/api/FetchData?referenceid=${employee.ReferenceID}`);
        if (!res.ok) {
          setProgressData([]);
          return;
        }
        const result = await res.json();
        const records = Array.isArray(result) ? result : result.data || [];
        setProgressData(records.filter((r: Progress) => r.referenceid === employee.ReferenceID));
      } catch {
        setProgressData([]);
      } finally {
        setProgressLoading(false);
      }
    };
    fetchProgress();
  }, [employee?.ReferenceID]);

  // Filter by date range
  const filteredProgress = progressData.filter((p) => {
    if (!p.date_created) return false;
    const recordDate = new Date(p.date_created);
    const start = startDate ? new Date(startDate + "T00:00:00") : new Date(-8640000000000000);
    const end = endDate ? new Date(endDate + "T23:59:59") : new Date(8640000000000000);
    return recordDate >= start && recordDate <= end;
  });

  if (loading)
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );

  if (!employee)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-center p-4">
        Employee not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-background/95 sm:p-6 md:p-10 p-4">
      {/* Top Section: Breadcrumbs right, DateRange left */}
      <div className="flex items-center justify-between max-w-6xl mx-auto mb-2">
        {/* DateRange left */}
        <div className="flex-shrink-0 order-2 sm:order-1">
          <DateRange
            startDate={startDate}
            endDate={endDate}
            setStartDateAction={setStartDate}
            setEndDateAction={setEndDate}
          />
        </div>

        {/* Breadcrumbs always top-right */}
        <div className="flex-shrink-0 order-1 sm:order-2 self-start sm:self-center ml-auto mt-6 mr-2">
          <Breadcrumbs currentPage={`Employee Form – ${employee.Lastname}, ${employee.Firstname}`} />
        </div>
      </div>

      {/* Employee Info & Logs */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 max-w-6xl mx-auto mb-6">
        {employee.ReferenceID &&
          !["Territory Sales Associate", "Territory Sales Manager", "Manager"].includes(
            employee.Role || ""
          ) && (
            <>
              <Card1 employee={employee} />
            </>
          )}
      </div>

      {/* TSA Dashboard */}
      {employee.Role === "Territory Sales Associate" && employee.ReferenceID && (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-6">
          <Card1 employee={employee} />
          <Card2 filteredProgress={filteredProgress} progressLoading={progressLoading} />
          <Card3
            employee={employee as any} // bypass TS check
            filteredProgress={filteredProgress}
            startDate={startDate}
            endDate={endDate}
          />
          <Card4 filteredProgress={filteredProgress} startDate={startDate} endDate={endDate} />
          <Card5 filteredProgress={filteredProgress} />
          <Card6 filteredProgress={filteredProgress} />
          <Card7 filteredProgress={filteredProgress} />
          <Card8 filteredProgress={filteredProgress} dateRange={{ start: startDate, end: endDate }} />
          <Card9 filteredProgress={filteredProgress} dateRange={{ start: startDate, end: endDate }} />
          <Card10 filteredProgress={filteredProgress} dateRange={{ start: startDate, end: endDate }} />
        </div>
      )}

      {/* TSM Dashboard */}
      {employee.Role === "Territory Sales Manager" && employee.ReferenceID && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-6xl mx-auto mb-6">
          <Card1 employee={employee} />
          <Card12 tsmReferenceID={employee.ReferenceID} dateRange={{ start: startDate, end: endDate }} />
        </div>
      )}

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-6xl mx-auto">
        {employee.ReferenceID && (
          <>
            <div className="text-center space-y-1 mb-6 mt-4">
              <h4 className="text-lg font-semibold tracking-tight">Employee Site Visits</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                A summary of field activities, client interactions, and overall site visit performance.
              </p>
            </div>

            <Separator className="my-2" />

            <Card13 ReferenceID={employee.ReferenceID} />
            <Card11
              filteredProgress={filteredProgress.map((p) => ({
                typeactivity: p.typeactivity,
                startdate: p.startdate,
                enddate: p.enddate,
                companyname: p.companyname
              }))}
              dateRange={{ start: startDate, end: endDate }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeFormPage;
