import MonthDispatch from "@/components/month";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dispatch monthly",
  description: "Dispatch monthly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <MonthDispatch />
      </div>
    </div>
  );
}
