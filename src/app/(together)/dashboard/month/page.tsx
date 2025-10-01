import type { Metadata } from "next";
import { CardMonthAll } from "@/components/reportCard/cardMonthAll";
import ChartDashboard from "@/components/charts/chartDashboardMonthly";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard Monthly",
  description: "Dashboard Monthly",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <CardMonthAll />
      <ChartDashboard />
    </div>
  );
}
