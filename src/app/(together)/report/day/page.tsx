import DayReport from "@/components/report/day";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Daily Report",
  description: "Daily Report",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <DayReport />
      </div>
    </div>
  );
}
