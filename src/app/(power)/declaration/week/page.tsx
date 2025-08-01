import WeekDeclaration from "@/components/week";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Declaration Weekly",
  description: "Declaration Weekly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <WeekDeclaration />
      </div>
    </div>
  );
}
