"use client";

import { useState } from "react";
import DailyChartTab from "./weeklyTab";
import HourlyChartTab from "./dateTab";

export default function TotalChart() {
  const [activeTab, setActiveTab] = useState<"weekly" | "date">("weekly");

  return (
    <>
      <div className="rounded-xl bg-white px-6 py-2 shadow-sm dark:bg-gray-900 dark:text-gray-100">
        <div className="mb-2 flex gap-4">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-4 py-2 font-medium ${
              activeTab === "weekly"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 dark:text-gray-300"
            }`}
          >
            Weekly
          </button>

          <button
            onClick={() => setActiveTab("date")}
            className={`px-4 py-2 font-medium ${
              activeTab === "date"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 dark:text-gray-300"
            }`}
          >
            Date
          </button>
        </div>
      </div>

      {activeTab === "weekly" && <DailyChartTab />}
      {activeTab === "date" && <HourlyChartTab />}
    </>
  );
}
