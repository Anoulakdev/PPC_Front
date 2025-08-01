import { Metadata } from "next";
import ClientView from "./ClientView";
import React from "react";

export const metadata: Metadata = {
  title: "Declaration monthly",
  description: "Declaration monthly",
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
