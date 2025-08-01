"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";

type CardMonthProps = {
  powerId: number | null;
};

type TotalPowerData = {
  lastMonth: {
    lastMonthStr: string;
    totalOriginal: number;
    totalCurrent: number;
  };
  currentMonth: {
    currentMonthStr: string;
    totalOriginal: number;
    totalCurrent: number;
  };
  year: {
    yearStr: string;
    totalOriginal: number;
    totalCurrent: number;
  };
};

export const CardMonth = ({ powerId }: CardMonthProps) => {
  const [data, setData] = useState<TotalPowerData | null>(null);

  useEffect(() => {
    if (!powerId) return;

    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(
          `/monthpowers/totalpowermonth/?powerId=${powerId}`,
        );
        setData(res.data);
      } catch (error) {
        console.error("Error fetching total power data:", error);
      }
    };

    fetchData();
  }, [powerId]);

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-2 flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Last Month
          </h1>
          <span className="text-sm font-semibold text-blue-500">
            {data.lastMonth?.lastMonthStr}
          </span>
        </div>

        <div className="mt-6 flex w-full items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-md text-gray-600 dark:text-white/70">
              Declaration
            </p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.lastMonth?.totalOriginal)} MWh
            </p>
          </div>

          <div className="px-2 text-center text-xl text-gray-600 dark:text-white/90">
            vs
          </div>

          <div className="text-right">
            <p className="text-md text-gray-600 dark:text-white/70">Dispatch</p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.lastMonth?.totalCurrent)} MWh
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
            {data.currentMonth?.currentMonthStr}
          </span>
        </div>

        <div className="mt-6 flex w-full items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-md text-gray-600 dark:text-white/70">
              Declaration
            </p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.currentMonth?.totalOriginal)} MWh
            </p>
          </div>

          <div className="px-2 text-center text-xl text-gray-600 dark:text-white/90">
            vs
          </div>

          <div className="text-right">
            <p className="text-md text-gray-600 dark:text-white/70">Dispatch</p>
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-white/60">
              {formatNumber(data.currentMonth?.totalCurrent)} MWh
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
