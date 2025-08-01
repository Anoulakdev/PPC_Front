import WeekView from "@/components/week/allweekview";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Document Weekly",
  description: "All Document Weekly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <WeekView />
      </div>
    </div>
  );
}
