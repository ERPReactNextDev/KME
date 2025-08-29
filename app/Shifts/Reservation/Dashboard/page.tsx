"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../components/Layouts/ParentLayout";
import SessionChecker from "../../components/Session/SessionChecker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
  ReferenceID: string;
  Email: string;
  Type: string;
  Status: string;
  Remarks: string;
  _id?: string;
  date_created?: string;
}

interface UserDetails {
  UserId: string;
  ReferenceID: string;
  Manager: string;
  TSM: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  Role: string;
  Department: string;
  Company: string;
}

const DashboardContent: React.FC = () => {
  return (
    <SessionChecker>
      <ParentLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-extrabold mb-6">Dashboard</h1>
        </div>

        <ToastContainer className="text-xs" autoClose={1000} />
      </ParentLayout>
    </SessionChecker>
  );
};

export default DashboardContent;
