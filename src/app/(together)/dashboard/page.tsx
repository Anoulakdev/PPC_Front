import type { Metadata } from "next";
import { CardDayDashboard } from "@/components/reportCard/cardDayDashboard";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <CardDayDashboard />
      </div>
    </div>
  );
}
