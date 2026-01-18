import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DailyDelete from "@/components/dailydelete";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Daily Delete",
  description: "Daily Delete",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Daily Delete" />
      <div className="space-y-6">
        <DailyDelete />
      </div>
    </div>
  );
}
