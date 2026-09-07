import Energy from "@/components/energy";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "NCC Dashboard",
  description: "NCC Dashboard",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <Energy />
      </div>
    </div>
  );
}
