import EventReport from "@/components/eventreport";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Event Report",
  description: "Event Report",
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <EventReport />
      </div>
    </div>
  );
}
