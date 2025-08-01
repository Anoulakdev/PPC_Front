import MonthRevise from "@/components/month/monthrevise";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Declaration monthly",
  description: "Declaration monthly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <MonthRevise />
      </div>
    </div>
  );
}
