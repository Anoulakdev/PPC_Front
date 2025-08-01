import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BranchList from "@/components/branch/BranchList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Branch",
  description: "Branch",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Branch" />
      <div className="space-y-6">
        <BranchList />
      </div>
    </div>
  );
}
