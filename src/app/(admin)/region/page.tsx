import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RegionList from "@/components/region/RegionList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Region",
  description: "Region",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Region" />
      <div className="space-y-6">
        <RegionList />
      </div>
    </div>
  );
}
