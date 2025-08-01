import WeekAction from "@/components/week/weekaction";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "dispatch Weekly",
  description: "dispatch Weekly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <WeekAction />
      </div>
    </div>
  );
}
