import ViewProfile from "@/components/account/viewProfile";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "View Profile",
  description: "View Profile",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-5 text-2xl font-semibold text-gray-800 lg:mb-7 dark:text-white/90">
          Profile
        </h3>
        <div className="space-y-6">
          <ViewProfile />
        </div>
      </div>
    </div>
  );
}
