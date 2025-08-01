import DayAction from "@/components/day/dayaction";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Declaration daily",
  description: "Declaration daily",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <DayAction />
      </div>
    </div>
  );
}
