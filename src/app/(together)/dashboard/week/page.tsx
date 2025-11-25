import type { Metadata } from "next";
import { CardWeekAll } from "@/components/reportCard/cardWeekAll";
import ChartDashboard from "@/components/charts/chartWeekly/chartDashboardWeekly";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard Weekly",
  description: "Dashboard Weekly",
};

export default function Dashboard() {
  return (
    <div className="space-y-3">
      <CardWeekAll />
      <ChartDashboard />
    </div>
  );
}
