/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, Fragment } from "react";
import DatePickerAll from "@/components/form/date-pickerall";
import moment from "moment";
// import axiosInstance from "@/utils/axiosInstance";
import { removeLocalStorage } from "@/utils/storage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { getLocalStorage } from "@/utils/storage";
import { EventSourcePolyfill } from "event-source-polyfill";

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
  decAcknow: boolean;
  disAcknow: boolean;
  decAcknowUser?: UserAcKnow | null;
  disAcknowUser?: UserAcKnow | null;
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

type UserAcKnow = {
  firstname: string;
  lastname: string;
};

export default function EnergyTablePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<ApiResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const token = getLocalStorage("token");
  const tabs = ["ALL", "NORTH", "CENTER", "SOUTH"];
  const [activeTab, setActiveTab] = useState("ALL");
  // map region
  const regionMap: Record<string, number | null> = {
    ALL: null,
    NORTH: 1,
    CENTER: 2,
    SOUTH: 3,
  };

  const hourLabels = Array.from({ length: 24 }, (_, i) => {
    const s = i.toString().padStart(2, "0");
    const e = ((i + 1) % 24).toString().padStart(2, "0");
    return `${s}:00-${e}:00`;
  });

  useEffect(() => {
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
    let sse: EventSourcePolyfill | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      setLoading(true);

      const regionId = regionMap[activeTab];
      const url = regionId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/daypowers/nccget?powerDate=${formattedDate}&regionId=${regionId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/daypowers/nccget?powerDate=${formattedDate}`;

      sse = new EventSourcePolyfill(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        heartbeatTimeout: 60000, // กัน idle
      });

      sse.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          if (Array.isArray(parsed)) setData(parsed);
          else if (parsed?.data && Array.isArray(parsed.data))
            setData(parsed.data);

          setLoading(false);
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      };

      sse.onerror = (err: any) => {
        console.error("SSE error — reconnecting...", err);
        setLoading(false);

        // ⛔ ถ้า token หมดอายุ → logout ทันที
        if (err?.status === 401) {
          handleLogout();
          return;
        }

        sse?.close();

        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            connect();
            reconnectTimer = null;
          }, 3000); // 3 วิ reconnect
        }
      };
    };

    connect();

    return () => {
      console.log("cleanup SSE");
      if (reconnectTimer) clearTimeout(reconnectTimer);
      sse?.close();
    };
  }, [selectedDate, activeTab]);

  const handleLogout = () => {
    removeLocalStorage("token");
    removeLocalStorage("user");

    // ลบ token จาก cookie
    document.cookie = "token=; path=/; max-age=0";

    toast.success("Logout");
    router.push("/");
  };

  return (
    <div className="space-y-3 p-3">
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

      {/* Tabs Section */}
      <div className="flex justify-center">
        <div className="inline-flex gap-1 rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`group relative overflow-hidden rounded-2xl px-8 py-3 text-sm font-bold transition-all duration-500 ${
                activeTab === tab
                  ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white shadow-2xl shadow-blue-500/40"
                  : "border border-white/20 bg-white/5 text-gray-700 backdrop-blur-sm hover:bg-white/20 hover:text-gray-900"
              }`}
            >
              <span className="relative z-10">{tab}</span>
              {activeTab === tab && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ▼ Table */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-lg">
        <table className="min-w-full border-collapse">
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
              <th className="border px-3 py-3 whitespace-nowrap">
                STATUS(DAD)
              </th>
              <th className="border px-3 py-3 whitespace-nowrap">STATUS(DD)</th>
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
                        {new Intl.NumberFormat("lo-LA").format(
                          Number(item.powerCurrent.totalPower),
                        )}
                      </td>

                      {item.powerCurrent.combinedHourly.map((h, i) => (
                        <td key={i} className="border px-3 py-2 text-center">
                          {h}
                        </td>
                      ))}

                      <td className="border px-3 py-2 text-center">
                        <div className="group relative inline-block">
                          {item.decAcknow ? (
                            <CheckCircleIcon className="mx-auto h-5 w-5 text-green-700" />
                          ) : (
                            <XCircleIcon className="mx-auto h-5 w-5 text-red-700" />
                          )}

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            {item.decAcknowUser
                              ? `${item.decAcknowUser.firstname ?? ""} ${item.decAcknowUser.lastname ?? ""}`.trim()
                              : "Not Acknowledge Yet"}
                          </div>
                        </div>
                      </td>

                      <td className="border px-3 py-2 text-center">
                        <div className="group relative inline-block">
                          {item.disAcknow ? (
                            <CheckCircleIcon className="mx-auto h-5 w-5 text-green-700" />
                          ) : (
                            <XCircleIcon className="mx-auto h-5 w-5 text-red-700" />
                          )}

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            {item.disAcknowUser
                              ? `${item.disAcknowUser.firstname ?? ""} ${item.disAcknowUser.lastname ?? ""}`.trim()
                              : "Not Acknowledge Yet"}
                          </div>
                        </div>
                      </td>
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
