import MonthReport from "@/components/report/month";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Monthly Report",
  description: "Monthly Report",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <MonthReport />
      </div>
    </div>
  );
}
