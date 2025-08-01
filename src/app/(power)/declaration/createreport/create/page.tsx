import CreateReport from "@/components/createreport/multiform";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Create Report",
  description: "Create Report",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <CreateReport />
      </div>
    </div>
  );
}
