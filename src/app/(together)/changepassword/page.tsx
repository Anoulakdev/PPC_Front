import ChangePassword from "@/components/account/changePassword";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Change Password",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <ChangePassword />
      </div>
    </div>
  );
}
