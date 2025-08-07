"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";

type TotalPowerData = {
  today: {
    todayStr: string;
    totalOriginal: number;
    totalCurrent: number;
  };
  month: {
    monthStr: string;
    totalOriginal: number;
    totalCurrent: number;
  };
  year: {
    yearStr: string;
    totalOriginal: number;
    totalCurrent: number;
  };
};

export const CardDayDashboard = () => {
  const [data, setData] = useState<TotalPowerData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/daypowers/totalpowerdashboard`);
        setData(res.data);
      } catch (error) {
        console.error("Error fetching total power data:", error);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (value: number | null | undefined) => {
    return value != null
      ? new Intl.NumberFormat("lo-LA", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)
      : "";
  };

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-2 flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Today
          </h1>
          <span className="text-sm font-semibold text-blue-500">
            {data.today?.todayStr}
          </span>
        </div>

        <div className="mt-6 flex w-full items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-md text-gray-600 dark:text-white/70">
              Declaration
            </p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.today?.totalOriginal)} MWh
            </p>
          </div>

          <div className="px-2 text-center text-xl text-gray-600 dark:text-white/90">
            vs
          </div>

          <div className="text-right">
            <p className="text-md text-gray-600 dark:text-white/70">Dispatch</p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.today?.totalCurrent)} MWh
            </p>
          </div>
        </div>
      </div>

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-2 flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Month
          </h1>
          <span className="text-sm font-semibold text-blue-500">
            {data.month?.monthStr}
          </span>
        </div>

        <div className="mt-6 flex w-full items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-md text-gray-600 dark:text-white/70">
              Declaration
            </p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.month?.totalOriginal)} MWh
            </p>
          </div>

          <div className="px-2 text-center text-xl text-gray-600 dark:text-white/90">
            vs
          </div>

          <div className="text-right">
            <p className="text-md text-gray-600 dark:text-white/70">Dispatch</p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.month?.totalCurrent)} MWh
            </p>
          </div>
        </div>
      </div>

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-2 flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Year
          </h1>
          <span className="text-sm font-semibold text-blue-500">
            {data.year?.yearStr}
          </span>
        </div>

        <div className="mt-6 flex w-full items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-md text-gray-600 dark:text-white/70">
              Declaration
            </p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.year?.totalOriginal)} MWh
            </p>
          </div>

          <div className="px-2 text-center text-xl text-gray-600 dark:text-white/90">
            vs
          </div>

          <div className="text-right">
            <p className="text-md text-gray-600 dark:text-white/70">Dispatch</p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.year?.totalCurrent)} MWh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
