import DayView from "@/components/day/alldayview";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Document Daily",
  description: "All Document Daily",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <DayView />
      </div>
    </div>
  );
}
