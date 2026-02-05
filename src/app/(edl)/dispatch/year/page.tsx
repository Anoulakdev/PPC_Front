import YearDispatch from "@/components/year";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dispatch yearly",
  description: "Dispatch yearly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <YearDispatch />
      </div>
    </div>
  );
}
