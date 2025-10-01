import type { Metadata } from "next";
import { CardWeekAll } from "@/components/reportCard/cardWeekAll";
import ChartDashboard from "@/components/charts/chartDashboardWeekly";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard Weekly",
  description: "Dashboard Weekly",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <CardWeekAll />
      <ChartDashboard />
    </div>
  );
}
