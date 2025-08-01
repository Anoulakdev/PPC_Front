import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VoltageList from "@/components/voltage/VoltageList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Voltage",
  description: "Voltage",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Voltage" />
      <div className="space-y-6">
        <VoltageList />
      </div>
    </div>
  );
}
