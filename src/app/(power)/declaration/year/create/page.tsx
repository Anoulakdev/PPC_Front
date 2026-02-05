import YearDeclaration from "@/components/year/multiform";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Declaration yearly",
  description: "Declaration yearly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <YearDeclaration />
      </div>
    </div>
  );
}
