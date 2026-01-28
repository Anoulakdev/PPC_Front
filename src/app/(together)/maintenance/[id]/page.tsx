import MaintenanceView from "@/components/maintenance/maintenanceView";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Maintenance Report",
  description: "Maintenance Report",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <MaintenanceView />
      </div>
    </div>
  );
}
