import MonthView from "@/components/month/allmonthview";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Document Monthly",
  description: "All Document Monthly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <MonthView />
      </div>
    </div>
  );
}
