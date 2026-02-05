import YearReport from "@/components/report/year";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Yearly Report",
  description: "Yearly Report",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <YearReport />
      </div>
    </div>
  );
}
