import ReportRevise from "@/components/createreport/reportrevise";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Report Revise",
  description: "Report Revise",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <ReportRevise />
      </div>
    </div>
  );
}
