"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { ChevronRightIcon } from "lucide-react";
import Search from "../Components/Tool/Search";

interface User {
  _id?: string;
  Firstname?: string;
  Lastname?: string;
  Email?: string;
  userName?: string;
  Position?: string;
  Department?: string;
  TargetQuota?: number | string;
  profilePicture?: string;
  companyname?: string;
  isCompany?: boolean;
}

const Home: React.FC = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [search, setSearch] = useState("");
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const highlightMatch = (text: string | undefined, query: string) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-muted font-semibold px-1 rounded-sm">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getInitials = (fname?: string, lname?: string) => {
    const first = fname?.[0] ?? "";
    const last = lname?.[0] ?? "";
    return first || last ? `${first}${last}`.toUpperCase() : "--";
  };

  const getRandomColor = (id?: string, fname?: string, lname?: string) => {
    const colors = [
      "bg-blue-500",
      "bg-pink-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-orange-500",
    ];
    const key = id || `${fname || ""}${lname || ""}` || "NA";
    return colors[key.charCodeAt(0) % colors.length];
  };

  const handleView = (empId?: string, name?: string) => {
    if (!empId) return;

    toast(`Opening ${name || "Employee"}`, {
      description: "Preparing employee profile...",
    });

    setProgressVisible(true);
    setProgress(0);

    let progressValue = 0;
    const timer = setInterval(() => {
      progressValue += 10;
      setProgress(progressValue);

      if (progressValue >= 100) {
        clearInterval(timer);
        router.push(`/form/${empId}`);
      }
    }, 100);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-start py-16 px-6">
      <div className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Know My Employee
        </h1>
        <p className="text-muted-foreground text-sm">
          Search and explore employee details in real-time.
        </p>
      </div>

      <div className="w-full max-w-lg">
        <Search
          setEmployees={setEmployees}
          setLoading={setLoading}
          setHasSearched={setHasSearched}
          setSearch={setSearch}
        />
      </div>

      {loading && (
        <Card className="flex items-center justify-between mt-6 p-4 text-sm shadow-sm border-muted max-w-lg w-full">
          <div className="flex items-center gap-3">
            <Spinner className="text-primary" />
            <span>Searching...</span>
          </div>
          <span className="text-xs text-muted-foreground">Please wait</span>
        </Card>
      )}

      {!loading && hasSearched && (
        <Card className="mt-6 w-full max-w-lg shadow-md border-muted p-4">
          {employees.length > 0 ? (
            <div className="flex flex-col gap-4">
              {/* Group companies by name */}
              {Object.entries(
                employees.reduce((acc, emp) => {
                  if (emp.isCompany) {
                    if (!acc[emp.companyname || ""]) acc[emp.companyname || ""] = emp;
                  } else {
                    acc[emp._id || `user-${Math.random()}`] = emp;
                  }
                  return acc;
                }, {} as Record<string, User>)
              ).map(([key, emp]) => (
                <Item
                  key={key}
                  variant="outline"
                  className="flex items-center justify-between p-4 hover:bg-accent/30 transition rounded-lg"
                >
                  <div className="flex items-center gap-4 w-full justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <ItemMedia>
                        {emp.isCompany ? (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gray-500">
                            {emp.companyname?.[0] || "C"}
                          </div>
                        ) : emp.profilePicture ? (
                          <img
                            src={emp.profilePicture}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRandomColor(
                              emp._id,
                              emp.Firstname,
                              emp.Lastname
                            )}`}
                          >
                            {getInitials(emp.Firstname, emp.Lastname)}
                          </div>
                        )}
                      </ItemMedia>

                      <ItemContent>
                        {emp.isCompany ? (
                          <ItemTitle className="font-semibold text-base">
                            {highlightMatch(emp.companyname, search)}
                          </ItemTitle>
                        ) : (
                          <>
                            <ItemTitle className="capitalize font-semibold text-base">
                              {highlightMatch(emp.Lastname, search)},{" "}
                              {highlightMatch(emp.Firstname, search)}
                            </ItemTitle>
                            <ItemDescription className="text-xs text-muted-foreground">
                              {highlightMatch(emp.Email || emp.userName, search)}
                            </ItemDescription>
                            <p className="text-xs mt-1 text-muted-foreground">
                              <span className="font-medium text-foreground">
                                Position:
                              </span>{" "}
                              {highlightMatch(emp.Position || "N/A", search)}
                            </p>
                          </>
                        )}
                      </ItemContent>
                    </div>

                    <ItemActions>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          emp.isCompany
                            ? toast(`${emp.companyname}`, { description: "Company selected." })
                            : handleView(emp._id, `${emp.Firstname || ""} ${emp.Lastname || ""}`)
                        }
                        className="flex items-center gap-1"
                      >
                        {emp.isCompany ? "Select" : "View"}{" "}
                        {!emp.isCompany && <ChevronRightIcon className="w-4 h-4" />}
                      </Button>
                    </ItemActions>
                  </div>
                </Item>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No results found.
            </p>
          )}
        </Card>
      )}


      {progressVisible && (
        <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center z-50 transition">
          <h2 className="text-xl font-semibold mb-6 text-primary">
            Redirecting...
          </h2>
          <Progress
            value={progress}
            className="w-[80%] h-3 rounded-full bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-3">
            Please wait while we open the employee form
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
