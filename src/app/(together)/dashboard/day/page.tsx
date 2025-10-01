import type { Metadata } from "next";
import { CardDayDashboard } from "@/components/reportCard/cardDayDashboard";
import ChartDashboard from "@/components/charts/chartDashboardDaily";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard Daily",
  description: "Dashboard Daily",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <CardDayDashboard />
      <ChartDashboard />
    </div>
  );
}
