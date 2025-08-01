import DayDeclaration from "@/components/day/multiform";
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
        <DayDeclaration />
      </div>
    </div>
  );
}
