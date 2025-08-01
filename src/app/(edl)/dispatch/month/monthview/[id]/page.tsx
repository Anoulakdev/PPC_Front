import ClientView from "./ClientView";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "dispatch monthly",
  description: "dispatch monthly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <ClientView />
      </div>
    </div>
  );
}
