import DayDispatch from "@/components/day";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dispatch daily",
  description: "Dispatch daily",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <DayDispatch />
      </div>
    </div>
  );
}
