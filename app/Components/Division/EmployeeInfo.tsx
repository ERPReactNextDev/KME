"use client";

import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheckIcon, AlertCircleIcon } from "lucide-react";

interface Employee {
  _id?: string;
  Firstname?: string;
  Lastname?: string;
  Position?: string;
  Department?: string;
  TargetQuota?: number | string;
  ReferenceID?: string;
  profilePicture?: string;
  Status?: "Active" | "Inactive" | "On Leave";
  Description?: string;
}

interface EmployeeInfoProps {
  employee?: Employee;
  loading?: boolean;
}

const EmployeeInfo: React.FC<EmployeeInfoProps> = ({ employee, loading }) => {
  if (loading) return <SkeletonDemo />;

  if (!employee) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
        No employee data available.
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="flex items-center gap-1 bg-green-500 text-white">
            <BadgeCheckIcon className="w-4 h-4" /> Active
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="flex items-center gap-1 bg-red-500 text-white">
            <AlertCircleIcon className="w-4 h-4" /> Inactive
          </Badge>
        );
      case "On Leave":
        return (
          <Badge className="flex items-center gap-1 bg-yellow-500 text-white">
            On Leave
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Description about Sales Associate and target
  const roleDescription = (position?: string, quota?: number | string) => {
    if (!position) return null;

    const quotaText =
      quota !== undefined
        ? typeof quota === "number"
          ? `$${quota.toLocaleString()} per month`
          : `${quota} per month`
        : "Not set";

    return (
      <p className="mt-2 text-gray-600">
        {position} is responsible for managing office sales activities, building
        client relationships, and achieving monthly sales targets. The
        employee's target quota is <strong>{quotaText}</strong>, ensuring
        consistent performance in the department.
      </p>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col items-center w-full mx-auto">

      {/* Avatar */}
      {employee.profilePicture ? (
        <Avatar className="mb-4 w-28 h-28">
          <AvatarImage src={employee.profilePicture} alt="Profile" />
          <AvatarFallback>
            {employee.Lastname?.[0]}
            {employee.Firstname?.[0]}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-28 h-28 rounded-full bg-gray-300 mb-4 flex items-center justify-center text-gray-700 text-2xl font-bold capitalize">
          {employee.Lastname?.[0]}
          {employee.Firstname?.[0]}
        </div>
      )}

      {/* Name */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize">
        {employee.Lastname}, {employee.Firstname}
      </h2>

      {/* Reference ID */}
      <p className="text-xs text-gray-500 mt-2">
        {employee.ReferenceID || "Not set"}
      </p>


      {/* Status Badge */}
      <div className="mt-2">{getStatusBadge(employee.Status)}</div>

      {/* Accordion for detailed info */}
      <Accordion type="single" collapsible className="w-full mt-4">
        <AccordionItem value="info">
          <AccordionTrigger>Employee Information</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 text-sm text-gray-700">
            <p>
              <strong>Position:</strong> {employee.Position || "N/A"}
            </p>
            <p>
              <strong>Department:</strong> {employee.Department || "N/A"}
            </p>
            
            {/* Description about role */}
            {roleDescription(employee.Position, employee.TargetQuota)}
            {/* Optional custom description */}
            {employee.Description && (
              <p className="mt-2 text-gray-600">{employee.Description}</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Skeleton while loading
const SkeletonDemo = () => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center w-full sm:w-[90%] md:w-[75%] lg:w-[60%]">
    <Skeleton className="h-28 w-28 rounded-full mb-4" />
    <Skeleton className="h-6 w-32 mb-2" />
    <Skeleton className="h-4 w-20 mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full" />
  </div>
);

export default EmployeeInfo;
