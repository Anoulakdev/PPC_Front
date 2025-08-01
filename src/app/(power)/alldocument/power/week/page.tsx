import AllDocument from "@/components/week/allweeklist";
import { CardWeekAll } from "@/components/reportCard/cardWeekAll";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Document Weekly",
  description: "All Document Weekly",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <CardWeekAll />
        <AllDocument />
      </div>
    </div>
  );
}
