import AllDocument from "@/components/month/allmonthlist";
import { CardMonthAll } from "@/components/reportCard/cardMonthAll";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Document Monthly",
  description: "All Document Monthly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <CardMonthAll />
        <AllDocument />
      </div>
    </div>
  );
}
