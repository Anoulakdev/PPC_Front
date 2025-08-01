import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ContractList from "@/components/contract/ContractList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Contract",
  description: "Contract",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Contract" />
      <div className="space-y-6">
        <ContractList />
      </div>
    </div>
  );
}
