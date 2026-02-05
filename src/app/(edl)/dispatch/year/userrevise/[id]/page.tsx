import UserRevise from "@/components/year/userRevise";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "dispatch yearly",
  description: "dispatch yearly",
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
