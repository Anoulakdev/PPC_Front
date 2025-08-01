import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FuelList from "@/components/fueltype/FuelList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Fuel Type",
  description: "Fuel Type",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Fuel Type" />
      <div className="space-y-6">
        <FuelList />
      </div>
    </div>
  );
}
