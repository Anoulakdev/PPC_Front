import WeekDispatch from "@/components/week";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dispatch Weekly",
  description: "Dispatch Weekly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <WeekDispatch />
      </div>
    </div>
  );
}
