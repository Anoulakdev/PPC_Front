import CreateReport from "@/components/createreport";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Hydrology Report",
  description: "Hydrology Report",
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
