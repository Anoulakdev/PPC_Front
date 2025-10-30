/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, Fragment } from "react";
import DatePickerAll from "@/components/form/date-pickerall";
import moment from "moment";
import axiosInstance from "@/utils/axiosInstance";
import { removeLocalStorage } from "@/utils/storage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface ApiResponse {
  companyId: number;
  companyName: string;
  items: PowerItem[];
}

interface PowerItem {
  id: number;
  powerId: number;
  powerNo: string;
  powerDate: string;
  power: {
    id: number;
    name: string;
    company: {
      id: number;
      name: string;
    };
  };
  powerCurrent: {
    totalPower: string;
    combinedHourly: number[];
  };
}

export default function EnergyTablePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<ApiResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hourLabels = Array.from({ length: 24 }, (_, i) => {
    const s = i.toString().padStart(2, "0");
    const e = ((i + 1) % 24).toString().padStart(2, "0");
    return `${s}:00-${e}:00`;
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

      const response = await axiosInstance.get(
        `/daypowers/nccget?powerDate=${formattedDate}`,
      );

      if (Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleLogout = () => {
    removeLocalStorage("token");
    removeLocalStorage("user");
    removeLocalStorage("day-power-storage");
    removeLocalStorage("week-power-storage");
    removeLocalStorage("month-power-storage");
    removeLocalStorage("create-report-storage");

    // ลบ token จาก cookie
    document.cookie = "token=; path=/; max-age=0";

    toast.success("Logout");
    router.push("/");
  };

  return (
    <div className="space-y-3 p-3">
      {/* <div className="rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 p-6 shadow-lg">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Hourly Power Dispatch
          </h1>
        </div>
      </div> */}

      {/* Date Filter Section */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-lg">
        <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-gray-700">
              <div className="rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 p-2 shadow-md">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                Select Date:
              </span>
            </div>
            <div className="w-full md:w-64">
              <DatePickerAll
                id="start-date"
                label=""
                defaultDate={selectedDate}
                onChange={(dates) => {
                  const selected = dates?.[0];
                  if (selected) setSelectedDate(selected);
                }}
              />
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-red-600 hover:to-pink-700 hover:shadow-lg active:scale-95 md:w-auto"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ▼ Table */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-lg">
        <table className="w-full min-w-[1800px] border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-700 to-teal-600 text-xs text-white">
              <th className="border px-3 py-3 whitespace-nowrap">
                Power Plant
              </th>
              <th className="border px-3 py-3 whitespace-nowrap">Total (MW)</th>

              {hourLabels.map((h, i) => (
                <th key={i} className="border px-3 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-sm">
            {loading && (
              <tr>
                <td
                  colSpan={28}
                  className="p-6 text-center font-semibold text-blue-600"
                >
                  Loading data...
                </td>
              </tr>
            )}

            {!loading &&
              data.length > 0 &&
              data.map((company) => (
                <Fragment key={`company-${company.companyId}`}>
                  {/* ▼ Company Row */}
                  <tr className="bg-gray-200 font-bold text-blue-700">
                    <td colSpan={28} className="px-3 py-2">
                      {company.companyName}
                    </td>
                  </tr>

                  {/* ▼ Plant Rows */}
                  {company.items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition even:bg-gray-50 hover:bg-blue-50"
                    >
                      <td className="border px-3 py-2 font-medium whitespace-nowrap">
                        {item.power.name}
                      </td>

                      <td className="border px-3 py-2 text-center font-bold text-green-700">
                        {Number(item.powerCurrent.totalPower)}
                      </td>

                      {item.powerCurrent.combinedHourly.map((h, i) => (
                        <td key={i} className="border px-3 py-2 text-center">
                          {h}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={28} className="p-6 text-center text-gray-400">
                  ❌ No Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
