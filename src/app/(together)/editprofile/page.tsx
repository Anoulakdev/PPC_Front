import EditProfile from "@/components/account/editProfile";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Edit Profile",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <EditProfile />
      </div>
    </div>
  );
}
