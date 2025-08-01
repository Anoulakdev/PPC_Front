import WeekAction from "@/components/week/weekaction";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Declaration weekly",
  description: "Declaration weekly",
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
