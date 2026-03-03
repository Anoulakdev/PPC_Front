import NetEnergyOutput from "@/components/netenergyoutput";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Net Energy Ouput Report",
  description: "Net Energy Ouput Report",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <NetEnergyOutput />
      </div>
    </div>
  );
}
