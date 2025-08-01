import WeekReport from "@/components/report/week";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Weekly Report",
  description: "Weekly Report",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <WeekReport />
      </div>
    </div>
  );
}
