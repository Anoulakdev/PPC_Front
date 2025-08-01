import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PowerList from "@/components/power/PowerList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Power",
  description: "Power",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Power" />
      <div className="space-y-6">
        <PowerList />
      </div>
    </div>
  );
}
