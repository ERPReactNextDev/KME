"use client";

import React, { useState, useEffect } from "react";
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
  const [started, setStarted] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [animateStart, setAnimateStart] = useState(false);

  // Check if START button should show (10 mins rule)
  useEffect(() => {
    const lastStart = sessionStorage.getItem("lastStartTime");
    if (lastStart) {
      const diff = Date.now() - parseInt(lastStart, 10);
      if (diff < 10 * 60 * 1000) {
        setStarted(true); // Don't show START if 10 mins not passed
      }
    }
  }, []);

  const handleStart = () => {
    setAnimateStart(true);
    sessionStorage.setItem("lastStartTime", Date.now().toString());

    setTimeout(() => {
      setStarted(true);
    }, 500); // match animation duration
  };

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
    <div className="relative min-h-screen flex flex-col items-center justify-between text-foreground py-16 px-6">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-5 -z-10"
        style={{ backgroundImage: 'url("/disruptive.jpg")' }}
      />

      {/* Header */}
      <header className="relative z-10 text-center w-full max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Know My Employee
        </h1>
        <p className="text-muted-foreground text-sm">
          Search and explore employee details in real-time.
        </p>
      </header>

      {/* Start Button Overlay */}
      {!started && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-20 transition-opacity duration-500 ${animateStart ? "opacity-0" : "opacity-100"
            }`}
        >
          <button
            onClick={handleStart}
            className={`w-40 h-40 rounded-full text-white text-xl font-bold flex items-center justify-center shadow-lg bg-cover bg-center transition-transform duration-500 ${animateStart ? "scale-150" : "scale-100"
              }`}
            style={{ backgroundImage: 'url("/KEME.png")' }}
          ></button>
        </div>
      )}

      {/* Search */}
      {started && (
        <div
          className={`w-full max-w-lg transition-all duration-700 z-10 ${searchFocused ? "mt-4" : "mt-40"
            }`}
        >
          <Search
            setEmployees={setEmployees}
            setLoading={setLoading}
            setHasSearched={setHasSearched}
            setSearch={setSearch}
          />
        </div>
      )}

      {/* Spinner */}
      {loading && (
        <Card className="flex items-center justify-between mt-6 p-4 text-sm shadow-sm border-muted max-w-lg w-full">
          <div className="flex items-center gap-3">
            <Spinner className="text-primary" />
            <span>Searching...</span>
          </div>
          <span className="text-xs text-muted-foreground">Please wait</span>
        </Card>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <Card className="mt-6 w-full max-w-lg bg-white shadow-md border-muted p-4">
          {employees.length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(
                employees.reduce((acc, emp) => {
                  if (emp.isCompany) {
                    if (!acc[emp.companyname || ""])
                      acc[emp.companyname || ""] = emp;
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
                            ? toast(`${emp.companyname}`, {
                              description: "Company selected.",
                            })
                            : handleView(
                              emp._id,
                              `${emp.Firstname || ""} ${emp.Lastname || ""}`
                            )
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
            <p className="text-center text-muted-foreground">No results found.</p>
          )}
        </Card>
      )}

      {/* Fullscreen Progress Overlay */}

      {progressVisible && (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-50 transition">
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

      {/* Footer */}
      <footer className="w-full mt-auto relative text-foreground py-10 flex flex-col items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-2">Disruptive Solutions Inc</h2>
          <p className="text-sm text-muted-foreground">
            Disruptive Solutions Inc. is Your Partner for Smart Solutions. With
            innovation at our core, we deliver premium, future-ready solutions
            that brighten spaces, reduce costs, and power smarter businesses.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
