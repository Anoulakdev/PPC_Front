import PowerPlant from "@/components/powerplant";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "power plant",
  description: "power plant",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <PowerPlant />
      </div>
    </div>
  );
}
