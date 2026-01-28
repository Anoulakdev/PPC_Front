"use client";

import { useState } from "react";
import PowerPlantTab from "./powerPlantTab";
import EDLTab from "./edlTab";

export default function TotalChart() {
  const [activeTab, setActiveTab] = useState<"powerPlant" | "edl">(
    "powerPlant",
  );

  return (
    <>
      <div className="rounded-xl bg-white px-6 py-2 mb-3 shadow-sm dark:bg-gray-900 dark:text-gray-100">
        <div className="mb-2 flex gap-4">
          <button
            onClick={() => setActiveTab("powerPlant")}
            className={`px-4 py-2 font-medium ${
              activeTab === "powerPlant"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 dark:text-gray-300"
            }`}
          >
            PowerPlant
          </button>

          <button
            onClick={() => setActiveTab("edl")}
            className={`px-4 py-2 font-medium ${
              activeTab === "edl"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 dark:text-gray-300"
            }`}
          >
            EDL
          </button>
        </div>
      </div>

      {activeTab === "powerPlant" && <PowerPlantTab />}
      {activeTab === "edl" && <EDLTab />}
    </>
  );
}
