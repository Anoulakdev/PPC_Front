/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "../../icons";
import moment from "moment";
import { useRouter } from "next/navigation";
import { encryptId } from "@/lib/cryptoId";
import { getLocalStorage } from "@/utils/storage";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePickerAll from "@/components/form/date-pickerall";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const hours = [
  "00:00-01:00",
  "01:00-02:00",
  "02:00-03:00",
  "03:00-04:00",
  "04:00-05:00",
  "05:00-06:00",
  "06:00-07:00",
  "07:00-08:00",
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00",
  "20:00-21:00",
  "21:00-22:00",
  "22:00-23:00",
  "23:00-00:00",
];

type TurbineData = {
  turbine: number;
  hourly: number[];
};

type UserAcKnow = {
  firstname: string;
  lastname: string;
};

type Power = {
  id: number;
  name: string;
  company: {
    name: string;
  };
};

type PowerOriginal = {
  totalPower: number | null;
  originalTurbines: TurbineData[];
};

type Day = {
  id: number;
  powerDate: string;
  activeStorageamount: string;
  activeStorageaverage: string;
  waterLevel: string;
  dwy: string;
  dwf: string;
  dwm: string;
  pws: string;
  inflowamount: string;
  inflowaverage: string;
  outflowamount: string;
  outflowaverage: string;
  spillwayamount: string;
  spillwayaverage: string;
  owramount: string;
  owraverage: string;
  rainFall: string;
  netEnergyOutput: string;
  waterRate: string;
  remarks: string;
  power?: Power;
  powerOriginal?: PowerOriginal;
  createdByUser?: UserAcKnow | null;
};

type User = {
  roleId: number;
  powers: { power: Power }[];
};

export default function DayTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState<Day[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedPowerId, startDate, endDate]);

  useEffect(() => {
    const fetchPowerList = async () => {
      if (!user) return;

      if (user.roleId === 3 || user.roleId === 4) {
        try {
          const response = await axiosInstance.get(`/powers/selectpower`);
          setPowerList(response.data);
        } catch (error) {
          console.error("Error fetching power list:", error);
        }
      } else if (user.roleId === 5 || user.roleId === 6) {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const localUser: User = JSON.parse(userStr);
            const powers = localUser.powers.map((p) => p.power);
            setPowerList(powers);
          }
        } catch (error) {
          console.error("Invalid user format in localStorage", error);
        }
      }
    };

    fetchPowerList();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const formatDate = (date: Date) => moment(date).format("YYYY-MM-DD");
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      let url = "";

      url = selectedPowerId
        ? `/dayreports?powerId=${selectedPowerId}&startDate=${start}&endDate=${end}`
        : `/dayreports?startDate=${start}&endDate=${end}`;

      const response = await axiosInstance.get(url);

      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (value: string) => {
    setSelectedPowerId(value);
  };

  const powerOptions = powerList.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const columns: ColumnDef<Day>[] = [
    {
      accessorKey: "powerDate",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return moment(value).format("DD/MM/YYYY");
      },
    },
    {
      accessorKey: "power.name",
    },
    {
      accessorKey: "powerOriginal.totalPower",
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value === null || value === undefined) return "-";
        return `${new Intl.NumberFormat("lo-LA").format(value)} MWh`;
      },
    },
    {
      accessorKey: "waterLevel",
    },
    {
      accessorKey: "dwy",
    },
    {
      accessorKey: "dwf",
    },
    {
      accessorKey: "dwm",
    },
    {
      accessorKey: "pws",
    },
    {
      accessorKey: "activeStorageamount",
    },
    {
      accessorKey: "activeStorageaverage",
    },
    {
      accessorKey: "inflowamount",
    },
    {
      accessorKey: "inflowaverage",
    },
    {
      accessorKey: "outflowamount",
    },
    {
      accessorKey: "outflowaverage",
    },
    {
      accessorKey: "spillwayamount",
    },
    {
      accessorKey: "spillwayaverage",
    },
    {
      accessorKey: "owramount",
    },
    {
      accessorKey: "owraverage",
    },
    {
      accessorKey: "rainFall",
    },
    {
      accessorKey: "netEnergyOutput",
    },
    {
      accessorKey: "waterRate",
    },
    {
      accessorKey: "createdByUser",
      cell: ({ row }) => {
        const firstname = row.original.createdByUser?.firstname ?? "";
        const lastname = row.original.createdByUser?.lastname ?? "";
        return `${firstname} ${lastname}`;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {(user?.roleId === 3 ||
            user?.roleId === 4 ||
            user?.roleId === 5 ||
            user?.roleId === 6) && (
            <div className="group relative inline-block">
              <button
                onClick={() =>
                  router.push(
                    `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/createreport/reportview/${encryptId(row.original.id)}`,
                  )
                }
                className="rounded p-1 text-gray-600 hover:bg-blue-100"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                View
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      // globalFilter,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const CreatePage = () => {
    router.push("/declaration/createreport/create");
  };

  const exportToExcel = () => {
    if (data) {
      const worksheet1 = XLSX.utils.json_to_sheet(
        data.map((item, index) => ({
          No: index + 1,
          Date: moment(item.powerDate).format("DD/MM/YYYY"),
          Declaration: item.power?.name ?? "",
          Total_Power: parseFloat(
            item.powerOriginal?.totalPower?.toString() ?? "0",
          ),
          WaterLevel: item.waterLevel ?? "",
          Diff_with_Yesterday: item.dwy ?? "",
          Diff_with_full: item.dwf ?? "",
          Diff_with_Min: item.dwm ?? "",
          Potential_Water_Storage: item.pws ?? "",
          Active_Storage_Amount: item.activeStorageamount ?? "",
          Active_Storage_Average: item.activeStorageaverage ?? "",
          Inflow_Amount: item.inflowamount ?? "",
          Inflow_Average: item.inflowaverage ?? "",
          Outflow_Amount: item.outflowamount ?? "",
          Outflow_Average: item.outflowaverage ?? "",
          Spillway_Amount: item.spillwayamount ?? "",
          Spillway_Average: item.spillwayaverage ?? "",
          Other_Water_Released_Amount: item.owramount ?? "",
          Other_Water_Released_Average: item.owraverage ?? "",
          Rain_Fall: item.rainFall ?? "",
          Net_Energy_Output: item.netEnergyOutput ?? "",
          Water_Rate: item.waterRate ?? "",
          CreatedBy: `${item.createdByUser?.firstname ?? ""} ${
            item.createdByUser?.lastname ?? ""
          }`.trim(),
        })),
      );

      const worksheet2 = XLSX.utils.json_to_sheet(
        data.map((item, index) => {
          const hourlyData =
            item.powerOriginal?.originalTurbines?.[0]?.hourly ?? [];

          const row: Record<string, any> = {
            No: index + 1,
            Date: moment(item.powerDate).format("DD/MM/YYYY"),
            Declaration: item.power?.name ?? "",
            Total_Power: parseFloat(
              item.powerOriginal?.totalPower?.toString() ?? "0",
            ),
            // CreatedBy ยังไม่ใส่ตรงนี้
          };

          // เพิ่มคอลัมน์ชั่วโมงทีหลัง
          hours.forEach((hour, i) => {
            row[hour] = hourlyData[i] ?? "";
          });

          // ใส่ CreatedBy ทีหลัง
          row.CreatedBy =
            `${item.createdByUser?.firstname ?? ""} ${item.createdByUser?.lastname ?? ""}`.trim();

          return row;
        }),
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet1, "Daily Report");
      XLSX.utils.book_append_sheet(workbook, worksheet2, "Daily Operation");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, `Create_Report_${moment().format("DDMMYYYY_HHmmss")}.xlsx`);
    }
  };

  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
        <div className="mb-3 flex flex-col items-center gap-3 md:flex-row">
          <div className="w-full md:w-1/4">
            <Label>Choose Power Source</Label>
            <div className="relative">
              <Select
                options={powerOptions}
                value={selectedPowerId ?? ""}
                placeholder="Select All Power"
                onChange={handleSelectChange}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/6">
            <DatePickerAll
              id="start-date"
              label="Start Date"
              defaultDate={startDate ?? undefined}
              onChange={(dates) => {
                const selected = dates?.[0] ?? null;
                setStartDate(selected);
              }}
            />
          </div>

          <div className="w-full md:w-1/6">
            <DatePickerAll
              id="end-date"
              label="End Date"
              defaultDate={endDate ?? undefined}
              onChange={(dates) => {
                const selected = dates?.[0] ?? null;
                setEndDate(selected);
              }}
            />
          </div>

          <button
            onClick={exportToExcel}
            disabled={loading || data.length === 0}
            className={`mt-2 self-start rounded-md bg-green-500 px-4 py-2 text-lg text-white hover:bg-green-600 md:mt-6 md:self-auto ${
              loading || data.length === 0
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            Excel
          </button>
        </div>
        <hr />

        <div className="mt-3 mb-4 flex items-center justify-between">
          {user?.roleId === 6 ? (
            <button
              onClick={CreatePage}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            >
              Create
            </button>
          ) : (
            <div></div>
          )}

          <button
            className="rounded p-1 text-red-600 hover:bg-red-100"
            onClick={fetchData}
          >
            <ArrowPathIcon className="h-7 w-7" />
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
              <thead className="bg-gray-100 text-sm whitespace-nowrap text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <tr className="bg-gray-100 text-center">
                  <th rowSpan={2} className="border px-2 py-2">
                    Date
                  </th>
                  <th rowSpan={2} className="border px-2 py-2">
                    Declaration
                  </th>
                  <th rowSpan={2} className="border px-2 py-2">
                    Total Power
                  </th>
                  <th className="border px-2 py-2">Water Level</th>
                  <th className="border px-2 py-2">Diff with Yesterday</th>
                  <th className="border px-2 py-2">Diff with Full</th>
                  <th className="border px-2 py-2">Diff with Min</th>
                  <th className="border px-2 py-2">Potential Water Storage</th>
                  <th colSpan={2} className="border px-2 py-2">
                    Active Storage
                  </th>
                  <th colSpan={2} className="border px-2 py-2">
                    Inflow
                  </th>
                  <th colSpan={2} className="border px-2 py-2">
                    Outflow
                  </th>
                  <th colSpan={2} className="border px-2 py-2">
                    Spill Way
                  </th>
                  <th colSpan={2} className="border px-2 py-2">
                    Other Water Released
                  </th>
                  <th className="border px-2 py-2">Rain fall</th>
                  <th className="border px-2 py-2">Net Energy Output (NEO)</th>
                  <th className="border px-2 py-2">Water Rate</th>
                  <th rowSpan={2} className="border px-2 py-2">
                    Created By
                  </th>
                  <th rowSpan={2} className="border px-2 py-2">
                    Action
                  </th>
                </tr>
                <tr className="bg-gray-100 text-center text-xs">
                  <th className="border px-2 py-2">masl</th>
                  <th className="border px-2 py-2">m</th>
                  <th className="border px-2 py-2">m</th>
                  <th className="border px-2 py-2">m</th>
                  <th className="border px-2 py-2">MCM</th>
                  <th className="border px-2 py-2">MCM</th>
                  <th className="border px-2 py-2">(%)</th>
                  <th className="border px-2 py-2">m³/s</th>
                  <th className="border px-2 py-2">MCM</th>
                  <th className="border px-2 py-2">m³/s</th>
                  <th className="border px-2 py-2">MCM</th>
                  <th className="border px-2 py-2">m³/s</th>
                  <th className="border px-2 py-2">MCM</th>
                  <th className="border px-2 py-2">m³/s</th>
                  <th className="border px-2 py-2">MCM</th>
                  <th className="border px-2 py-2">mm</th>
                  <th className="border px-2 py-2">kWh</th>
                  <th className="border px-2 py-2">m³/kWh</th>
                </tr>
              </thead>
              <tbody className="text-center text-sm text-gray-700 dark:text-gray-300">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded border px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              previous
            </button>
            <span className="text-gray-600">
              page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded border px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              next
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="rowsPerPage" className="text-gray-600">
              rows per page:
            </label>
            <select
              id="rowsPerPage"
              className="rounded border px-2 py-1"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>

            <div className="ps-3 text-sm text-gray-600">
              {(() => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const totalRows = table.getFilteredRowModel().rows.length;
                const start = pageIndex * pageSize + 1;
                const end = Math.min(start + pageSize - 1, totalRows);
                return `${start} - ${end} of ${totalRows}`;
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
