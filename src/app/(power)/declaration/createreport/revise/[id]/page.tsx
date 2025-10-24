import UserRevise from "@/components/createreport/revise";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "CreateReport Revise",
  description: "CreateReport Revise",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <UserRevise />
      </div>
    </div>
  );
}
