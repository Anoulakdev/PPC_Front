import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OwnerList from "@/components/owner/OwnerList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Owner",
  description: "Owner",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Owner" />
      <div className="space-y-6">
        <OwnerList />
      </div>
    </div>
  );
}
