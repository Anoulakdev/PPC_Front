import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompanyList from "@/components/company/CompanyList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Company",
  description: "Company",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Company" />
      <div className="space-y-6">
        <CompanyList />
      </div>
    </div>
  );
}
