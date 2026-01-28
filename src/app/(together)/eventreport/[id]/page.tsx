import EventView from "@/components/eventreport/eventView";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Event Report",
  description: "Event Report",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <div className="space-y-6">
        <EventView />
      </div>
    </div>
  );
}
