import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleList from "@/components/role/RoleList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Role",
  description: "Role",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Role" />
      <div className="space-y-6">
        <RoleList />
      </div>
    </div>
  );
}
