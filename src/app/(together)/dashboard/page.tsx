import type { Metadata } from "next";
import { CardDayDashboard } from "@/components/reportCard/cardDayDashboard";
import ChartDashboard from "@/components/charts/chartDashboard";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <CardDayDashboard />
      <ChartDashboard />
    </div>
  );
}
