"use client";

import React, { useState } from "react";
import { LuChevronRight } from "react-icons/lu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface BreadcrumbsProps {
  currentPage: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPage }) => {
  const router = useRouter();
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Show fullscreen overlay
    setProgressVisible(true);
    setProgress(0);

    let progressValue = 0;
    const timer = setInterval(() => {
      progressValue += 10;
      setProgress(progressValue);

      if (progressValue >= 100) {
        clearInterval(timer);
        router.push("/"); // Navigate to home
      }
    }, 100);
  };

  return (
    <>
      <Breadcrumb className="max-w-5xl mx-auto mb-4 sm:mb-6">
        <BreadcrumbList className="flex items-center text-sm text-gray-600 flex-wrap">
          {/* Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a
                href="/"
                onClick={handleHomeClick}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition"
              >
                Home
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <LuChevronRight className="mx-2 w-4 h-4 text-gray-400" />
          </BreadcrumbSeparator>

          {/* Current page */}
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-700 capitalize">{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 🔄 Fullscreen Progress Overlay */}
      {progressVisible && (
        <div className="fixed inset-0 bg-background/95 flex flex-col items-center justify-center z-50 transition">
          <h2 className="text-xl font-semibold mb-6 text-primary">Redirecting...</h2>
          <Progress
            value={progress}
            className="w-[80%] h-3 rounded-full bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-3">
            Please wait while we navigate to Home
          </p>
        </div>
      )}
    </>
  );
};

export default Breadcrumbs;
