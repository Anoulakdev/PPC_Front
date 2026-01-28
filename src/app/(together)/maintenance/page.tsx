import Maintenance from "@/components/maintenance";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Maintenance Plan",
  description: "Maintenance Plan",
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <Maintenance />
      </div>
    </div>
  );
}
