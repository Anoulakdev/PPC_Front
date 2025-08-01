import ReportView from "@/components/createreport/reportview";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Report View",
  description: "Report View",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <ReportView />
      </div>
    </div>
  );
}
