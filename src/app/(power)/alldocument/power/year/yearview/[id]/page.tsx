import YearView from "@/components/year/allyearview";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Document Yearly",
  description: "All Document Yearly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <YearView />
      </div>
    </div>
  );
}
