import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserList from "@/components/user/superadmin/UserList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "User",
  description: "User",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="User" />
      <div className="space-y-6">
        <UserList />
      </div>
    </div>
  );
}
