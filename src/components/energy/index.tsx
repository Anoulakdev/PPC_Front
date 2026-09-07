/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import DatePickerAll from "@/components/form/date-pickerall";
import moment from "moment";
import { removeLocalStorage } from "@/utils/storage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import { getLocalStorage } from "@/utils/storage";
import { EventSourcePolyfill } from "event-source-polyfill";
import { saveAs } from "file-saver";
import { hours1, hours2, hours3 } from "@/utils/hoursHelper";

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
    installCapacity: string;
    company: {
      id: number;
      name: string;
    };
    hourListId?: number | null;
  };
  powerOriginal: {
    totalPower: string;
    combinedHourlyOriginal: number[];
    originalTurbines?: Array<{ hourly: number[] }>;
  };
  powerCurrent: {
    totalPower: string;
    combinedHourlyCurrent: number[];
    currentTurbines?: Array<{ hourly: number[] }>;
  };
}

type UserAcKnow = {
  firstname: string;
  lastname: string;
};

// Helper: ตรวจสอบจำนวน slots (24, 48 หรือ 96 ค่า) ของแต่ละโรงไฟฟ้า
const getItemSlotCount = (item: any): 24 | 48 | 96 => {
  const hourListId = Number(item.power?.hourListId ?? item.hourListId);
  if (hourListId === 3) return 96;
  if (hourListId === 2) return 48;
  if (hourListId === 1) return 24;

  const curLen =
    item.powerCurrent?.combinedHourlyCurrent?.length ??
    item.powerCurrent?.currentTurbines?.[0]?.hourly?.length;
  const origLen =
    item.powerOriginal?.combinedHourlyOriginal?.length ??
    item.powerOriginal?.originalTurbines?.[0]?.hourly?.length;

  if (curLen === 96 || origLen === 96) return 96;
  if (curLen === 48 || origLen === 48) return 48;
  return 24;
};

export default function EnergyTablePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<ApiResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const router = useRouter();
  const token = getLocalStorage("token");
  const tabs = ["ALL", "NORTH", "CENTER", "SOUTH"];
  const [activeTab, setActiveTab] = useState("ALL");

  // Accordion state สำหรับแต่ละ Section (24, 48, 96 ค่า) - ค่าเริ่มต้นเปิดทุก Section
  const [collapsed, setCollapsed] = useState<{ [key: number]: boolean }>({
    24: false,
    48: false,
    96: false,
  });

  const toggleSection = (slots: number) => {
    setCollapsed((prev) => ({
      ...prev,
      [slots]: !prev[slots],
    }));
  };

  const toggleAllSections = () => {
    const areAllCollapsed = Object.values(collapsed).every(Boolean);
    setCollapsed({
      24: !areAllCollapsed,
      48: !areAllCollapsed,
      96: !areAllCollapsed,
    });
  };

  // map region
  const regionMap: Record<string, number | null> = {
    ALL: null,
    NORTH: 1,
    CENTER: 2,
    SOUTH: 3,
  };

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

  // จัดกลุ่มข้อมูลแยกตาม 3 Section (24, 48 และ 96 ค่า)
  const sections = useMemo(() => {
    const configs = [
      {
        slots: 24 as const,
        slotsName: "1 Hour",
        title: "1 Hour Interval Plants (24 Values)",
        subTitle: "Hourly Generation Telemetry",
        hours: hours1,
        badgeGradient: "from-blue-600 to-indigo-600",
        headerBg: "bg-blue-700",
        plantStickyBg: "bg-blue-800",
        thBorder: "border-blue-600",
        dotColor: "bg-blue-500",
      },
      {
        slots: 48 as const,
        slotsName: "30 Minute",
        title: "30 Minute Interval Plants (48 Values)",
        subTitle: "Half-Hourly Generation Telemetry",
        hours: hours2,
        badgeGradient: "from-teal-600 to-emerald-600",
        headerBg: "bg-teal-700",
        plantStickyBg: "bg-teal-800",
        thBorder: "border-teal-600",
        dotColor: "bg-teal-500",
      },
      {
        slots: 96 as const,
        slotsName: "15 Minute",
        title: "15 Minute Interval Plants (96 Values)",
        subTitle: "Quarter-Hourly Generation Telemetry",
        hours: hours3,
        badgeGradient: "from-purple-600 to-violet-600",
        headerBg: "bg-purple-800",
        plantStickyBg: "bg-purple-900",
        thBorder: "border-purple-700",
        dotColor: "bg-purple-500",
      },
    ];

    return configs.map((cfg) => {
      const companies = data
        .map((company) => ({
          ...company,
          items: company.items.filter(
            (item) => getItemSlotCount(item) === cfg.slots,
          ),
        }))
        .filter((company) => company.items.length > 0);

      const plantCount = companies.reduce(
        (sum, company) => sum + company.items.length,
        0,
      );

      return {
        ...cfg,
        companies,
        plantCount,
      };
    });
  }, [data]);

  const totalAllPlants = useMemo(
    () => sections.reduce((sum, s) => sum + s.plantCount, 0),
    [sections],
  );

  // Export to Excel แยกตาม Sheet ของแต่ละกลุ่มช่วงเวลาอย่างถูกต้อง
  const exportToExcel = async () => {
    if (!data || totalAllPlants === 0) {
      toast.warning("No data to export");
      return;
    }

    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    let hasAddedSheet = false;

    // ตรวจสอบว่ามีกี่ Section ที่มีข้อมูล
    const activeSections = sections.filter((s) => s.plantCount > 0);

    activeSections.forEach((sec) => {
      const flatData = sec.companies.flatMap((company) =>
        company.items.map((item) => ({
          companyName: company.companyName,
          item,
        })),
      );

      // กำหนดชื่อ Sheet ให้เข้าใจง่าย
      const declSheetName =
        activeSections.length === 1 && sec.slots === 24
          ? "Daily Declaration"
          : `Declaration (${sec.slotsName})`;

      const dispSheetName =
        activeSections.length === 1 && sec.slots === 24
          ? "Daily Dispatch"
          : `Dispatch (${sec.slotsName})`;

      // ==============================
      // 📄 Sheet Declaration
      // ==============================
      const declRows = flatData.map((row, index) => {
        const hourlyData =
          row.item.powerOriginal?.combinedHourlyOriginal ??
          row.item.powerOriginal?.originalTurbines?.[0]?.hourly ??
          [];
        const excelRow: Record<string, any> = {
          No: index + 1,
          Date: row.item.powerDate
            ? moment(row.item.powerDate).format("DD/MM/YYYY")
            : moment(selectedDate).format("DD/MM/YYYY"),
          Company: row.companyName,
          Power_Plant: row.item.power?.name ?? "",
          Install_Capacity_MW: parseFloat(
            row.item.power?.installCapacity ?? "0",
          ),
          Total_Energy_MWh: parseFloat(
            row.item.powerOriginal?.totalPower?.toString() ?? "0",
          ),
        };

        sec.hours.forEach((hour, i) => {
          const val = hourlyData[i];
          excelRow[hour] =
            val !== undefined && val !== null && !isNaN(Number(val))
              ? Number(Number(val).toFixed(2))
              : "";
        });

        return excelRow;
      });

      // ==============================
      // 📄 Sheet Dispatch
      // ==============================
      const dispRows = flatData.map((row, index) => {
        const hourlyData =
          row.item.powerCurrent?.combinedHourlyCurrent ??
          row.item.powerCurrent?.currentTurbines?.[0]?.hourly ??
          [];
        const excelRow: Record<string, any> = {
          No: index + 1,
          Date: row.item.powerDate
            ? moment(row.item.powerDate).format("DD/MM/YYYY")
            : moment(selectedDate).format("DD/MM/YYYY"),
          Company: row.companyName,
          Power_Plant: row.item.power?.name ?? "",
          Install_Capacity_MW: parseFloat(
            row.item.power?.installCapacity ?? "0",
          ),
          Total_Energy_MWh: parseFloat(
            row.item.powerCurrent?.totalPower?.toString() ?? "0",
          ),
        };

        sec.hours.forEach((hour, i) => {
          const val = hourlyData[i];
          excelRow[hour] =
            val !== undefined && val !== null && !isNaN(Number(val))
              ? Number(Number(val).toFixed(2))
              : "";
        });

        excelRow["STATUS_DAD"] = row.item.decAcknow
          ? `${row.item.decAcknowUser?.firstname ?? ""} ${row.item.decAcknowUser?.lastname ?? ""
            }`.trim()
          : "Not Acknowledge Yet";

        excelRow["STATUS_DD"] = row.item.disAcknow
          ? `${row.item.disAcknowUser?.firstname ?? ""} ${row.item.disAcknowUser?.lastname ?? ""
            }`.trim()
          : "Not Acknowledge Yet";

        return excelRow;
      });

      const wsDecl = XLSX.utils.json_to_sheet(declRows);
      const wsDisp = XLSX.utils.json_to_sheet(dispRows);

      // กำหนดความกว้างคอลัมน์ให้อ่านง่ายทั้ง 24, 48 และ 96 ค่า
      const cols = [
        { wch: 6 }, // No
        { wch: 12 }, // Date
        { wch: 25 }, // Company
        { wch: 25 }, // Power_Plant
        { wch: 20 }, // Install_Capacity_MW
        { wch: 18 }, // Total_Energy_MWh
        ...sec.hours.map(() => ({ wch: 14 })), // Dynamic time intervals
        { wch: 22 }, // STATUS_DAD
        { wch: 22 }, // STATUS_DD
      ];

      wsDecl["!cols"] = cols.slice(0, 6 + sec.hours.length);
      wsDisp["!cols"] = cols;

      XLSX.utils.book_append_sheet(workbook, wsDecl, declSheetName);
      XLSX.utils.book_append_sheet(workbook, wsDisp, dispSheetName);

      hasAddedSheet = true;
    });

    if (!hasAddedSheet) {
      toast.warning("No data to export");
      return;
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `${moment(selectedDate).format("DDMMYYYY")}_NCC_Energy_${moment().format(
        "HHmmss",
      )}.xlsx`,
    );
  };

  // Export to PDF ด้วย Puppeteer จาก API route
  const exportToPDF = async () => {
    if (!data || totalAllPlants === 0) {
      toast.warning("No data to export");
      return;
    }

    try {
      setIsExportingPDF(true);
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      const regionId = regionMap[activeTab];

      const response = await fetch("/api/report/pdf/energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          powerDate: formattedDate,
          activeTab,
          regionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      saveAs(
        blob,
        `NCC_Energy_${moment(selectedDate).format("DDMMYYYY")}_${activeTab}_${moment().format("HHmmss")}.pdf`,
      );
      toast.success("PDF exported successfully");
    } catch (err: any) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to export PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-4 p-3 sm:p-4">
      {/* Style Tag for custom animations */}
      <style>{`
        @keyframes shimmer-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-line {
          animation: shimmer-line 1.5s infinite linear;
        }
      `}</style>

      {/* Date Filter & Action Section */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 sm:p-6 shadow-lg">
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Excel Button */}
            <button
              onClick={exportToExcel}
              disabled={totalAllPlants === 0}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-600 hover:to-green-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed md:w-auto"
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
                  d="M4 4v16m0 0h16m-16 0l6-6m0 0l6 6"
                />
              </svg>
              <span>Excel</span>
            </button>

            {/* PDF Button */}
            <button
              onClick={exportToPDF}
              disabled={totalAllPlants === 0 || isExportingPDF}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-rose-600 hover:to-red-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed md:w-auto"
            >
              {isExportingPDF ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
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
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-6 4h4"
                  />
                </svg>
              )}
              <span>PDF</span>
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-100/80 px-4 py-2.5 text-sm font-semibold text-red-600 shadow-xs transition-all hover:bg-red-200 hover:border-red-300 hover:text-red-700 active:scale-95 md:w-auto"
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
      </div>

      {/* Tabs Section (Regions) */}
      <div className="flex justify-center w-full px-2 sm:px-0">
        <div className="flex w-full max-w-md sm:w-auto sm:inline-flex gap-1 rounded-2xl sm:rounded-3xl border border-white/20 bg-white/10 p-1 sm:p-2 shadow-2xl backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none group relative overflow-hidden rounded-xl sm:rounded-2xl px-1.5 py-2.5 sm:px-8 sm:py-3 text-[10px] min-[360px]:text-xs sm:text-sm font-bold transition-all duration-500 ${activeTab === tab
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

      {/* Quick Summary & Section Anchor Bar */}
      {totalAllPlants > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider mr-1">
              Intervals:
            </span>
            {sections
              .filter((sec) => sec.plantCount > 0)
              .map((sec) => (
                <button
                  key={sec.slots}
                  onClick={() => {
                    const el = document.getElementById(`section-${sec.slots}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition hover:shadow-sm bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${sec.dotColor}`} />
                  <span>{sec.slotsName}</span>
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800">
                    {sec.plantCount}
                  </span>
                </button>
              ))}
          </div>

          <button
            onClick={toggleAllSections}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
          >
            {Object.values(collapsed).every(Boolean)
              ? "Expand All Sections"
              : "Collapse All Sections"}
          </button>
        </div>
      )}

      {/* Real-time Shimmer Line Indicator */}
      {loading && (
        <div className="h-1.5 overflow-hidden rounded-full bg-blue-100 shadow-inner">
          <div className="h-full w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 animate-shimmer-line shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        </div>
      )}

      {/* Global No Data Fallback */}
      {!loading && totalAllPlants === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">⚡</span>
            <span className="text-base font-semibold text-gray-700">
              No Data Available
            </span>
            <span className="text-xs text-gray-400">
              No telemetry data found for the selected date and region.
            </span>
          </div>
        </div>
      )}

      {/* ▼ STACKED SECTIONS (แนวทางที่ 2: 24, 48 และ 96 ค่า) */}
      <div className="space-y-6">
        {sections
          .filter((sec) => sec.plantCount > 0)
          .map((sec) => {
            const isCollapsed = collapsed[sec.slots];
            const colSpanTotal = sec.hours.length + 5; // Plant, Cap, Total, DAD, DD

            return (
              <div
                key={sec.slots}
                id={`section-${sec.slots}`}
                className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden transition-all duration-300"
              >
                {/* Section Accordion Header */}
                <div
                  onClick={() => toggleSection(sec.slots)}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200 cursor-pointer select-none hover:bg-gray-100/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">
                      {sec.title}
                    </h2>
                    <span className="text-xs font-medium text-gray-500 hidden md:inline">
                      ({sec.subTitle})
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${sec.plantCount > 0
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-400"
                        }`}
                    >
                      {sec.plantCount}{" "}
                      {sec.plantCount === 1 ? "Plant" : "Plants"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 hover:text-gray-800">
                    <span className="text-xs font-medium hidden sm:inline">
                      {isCollapsed ? "Click to Expand" : "Click to Collapse"}
                    </span>
                    <div className="rounded-md p-1 hover:bg-gray-200/70 transition">
                      {isCollapsed ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                {!isCollapsed && (
                  <div className="relative max-h-[75vh] overflow-x-auto overflow-y-auto">
                    <table className="w-full min-w-full border-collapse text-xs">
                      <thead className={`sticky top-0 z-20 ${sec.headerBg}`}>
                        <tr className="text-white">
                          {/* Pinned Left Column: Power Plant */}
                          <th
                            className={`sticky left-0 top-0 z-30 border px-3 py-2 text-left font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.25)] ${sec.plantStickyBg} ${sec.thBorder} align-middle whitespace-nowrap`}
                            style={{
                              minWidth: sec.slots === 96 ? "130px" : "150px",
                              maxWidth: sec.slots === 96 ? "160px" : "200px",
                            }}
                          >
                            Power Plant
                          </th>

                          <th className={`sticky top-0 border ${sec.thBorder} ${sec.headerBg} px-1 py-1 text-center align-middle text-[11px] font-bold leading-tight w-16`}>
                            Install<br />Capacity<br />(MW)
                          </th>

                          <th className={`sticky top-0 border ${sec.thBorder} ${sec.headerBg} px-1 py-1 text-center align-middle text-[11px] font-bold leading-tight w-16`}>
                            Total<br />Energy<br />(MWh)
                          </th>

                          {/* Vertical time headers from hoursHelper to save space and fit screen */}
                          {sec.hours.map((h, i) => (
                            <th
                              key={i}
                              className={`sticky top-0 border text-center font-semibold select-none align-middle ${sec.thBorder} ${sec.headerBg} ${sec.slots === 96
                                ? "px-0 text-[8.5px]"
                                : sec.slots === 48
                                  ? "px-0.5 text-[9.5px]"
                                  : "px-0.5 text-[10.5px]"
                                }`}
                              style={{
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                                whiteSpace: "nowrap",
                                height: "78px",
                              }}
                            >
                              <span className="inline-block py-1 tracking-wider">
                                {h}
                              </span>
                            </th>
                          ))}

                          <th className={`sticky top-0 border ${sec.thBorder} ${sec.headerBg} px-1.5 py-2 text-center whitespace-nowrap align-middle text-[11px] font-bold w-12`}>
                            DAD
                          </th>

                          <th className={`sticky top-0 border ${sec.thBorder} ${sec.headerBg} px-1.5 py-2 text-center whitespace-nowrap align-middle text-[11px] font-bold w-12`}>
                            DD
                          </th>
                        </tr>
                      </thead>

                      <tbody className="text-sm divide-y divide-gray-200">
                        {sec.companies.map((company) => (
                          <Fragment
                            key={`sec-${sec.slots}-comp-${company.companyId}`}
                          >
                            {/* Company Row */}
                            <tr className="bg-gray-100 font-bold text-blue-900 border-b border-gray-300">
                              <td
                                colSpan={colSpanTotal}
                                className="p-0 bg-gray-100"
                              >
                                <div className="sticky left-0 z-10 inline-flex items-center px-3 py-1.5 text-xs font-bold text-blue-900 whitespace-nowrap">
                                  🏢 {company.companyName} ({company.items.length}{" "}
                                  {company.items.length === 1
                                    ? "Plant"
                                    : "Plants"}
                                  )
                                </div>
                              </td>
                            </tr>

                            {/* Plant Rows */}
                            {company.items.map((item) => (
                              <tr
                                key={item.id}
                                className="group transition hover:bg-blue-50/70"
                              >
                                {/* Pinned Left Column: Plant Name */}
                                <td
                                  className="sticky left-0 z-10 border px-3 py-1.5 font-semibold text-gray-900 whitespace-nowrap bg-white group-hover:bg-blue-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-xs truncate"
                                  style={{
                                    maxWidth:
                                      sec.slots === 96 ? "160px" : "200px",
                                  }}
                                  title={item.power.name}
                                >
                                  {item.power.name}
                                </td>

                                <td className="border px-1 py-1.5 text-center font-bold text-green-700 whitespace-nowrap text-xs">
                                  {new Intl.NumberFormat("lo-LA").format(
                                    Number(item.power.installCapacity),
                                  )}
                                </td>

                                <td className="border px-1 py-1.5 text-center font-bold text-green-700 whitespace-nowrap text-xs">
                                  {new Intl.NumberFormat("lo-LA").format(
                                    Number(item.powerCurrent.totalPower),
                                  )}
                                </td>

                                {/* Values according to slotCount */}
                                {sec.hours.map((_, i) => {
                                  const val =
                                    item.powerCurrent?.combinedHourlyCurrent?.[i];
                                  return (
                                    <td
                                      key={i}
                                      className={`border text-center font-mono tabular-nums whitespace-nowrap ${sec.slots === 96
                                        ? "px-0.5 py-1 text-[8.5px]"
                                        : sec.slots === 48
                                          ? "px-0.5 py-1 text-[10px]"
                                          : "px-0.5 py-1.5 text-[11px]"
                                        }`}
                                    >
                                      {val !== undefined && val !== null
                                        ? typeof val === "number"
                                          ? Number(val.toFixed(2))
                                          : !isNaN(Number(val))
                                            ? Number(Number(val).toFixed(2))
                                            : val
                                        : "-"}
                                    </td>
                                  );
                                })}

                                {/* STATUS (DAD) */}
                                <td className="border px-1 py-1.5 text-center">
                                  <div className="group/tooltip relative inline-block">
                                    {item.decAcknow ? (
                                      <CheckCircleIcon className="mx-auto h-5 w-5 text-green-600" />
                                    ) : (
                                      <XCircleIcon className="mx-auto h-5 w-5 text-red-500" />
                                    )}
                                    <div className="absolute bottom-full right-0 z-30 mb-2 hidden group-hover/tooltip:block rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap shadow-md pointer-events-none">
                                      {item.decAcknowUser
                                        ? `${item.decAcknowUser.firstname ?? ""
                                          } ${item.decAcknowUser.lastname ?? ""
                                          }`.trim()
                                        : "Not Acknowledge Yet"}
                                    </div>
                                  </div>
                                </td>

                                {/* STATUS (DD) */}
                                <td className="border px-1 py-1.5 text-center">
                                  <div className="group/tooltip relative inline-block">
                                    {item.disAcknow ? (
                                      <CheckCircleIcon className="mx-auto h-5 w-5 text-green-600" />
                                    ) : (
                                      <XCircleIcon className="mx-auto h-5 w-5 text-red-500" />
                                    )}
                                    <div className="absolute bottom-full right-0 z-30 mb-2 hidden group-hover/tooltip:block rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap shadow-md pointer-events-none">
                                      {item.disAcknowUser
                                        ? `${item.disAcknowUser.firstname ?? ""
                                          } ${item.disAcknowUser.lastname ?? ""
                                          }`.trim()
                                        : "Not Acknowledge Yet"}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
