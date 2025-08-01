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
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "../../icons";
import { useRouter } from "next/navigation";
import { encryptId } from "@/lib/cryptoId";
import Select from "@/components/form/Select";
import Label from "../form/Label";
import SelectDate from "@/components/form/SelectDate";
import { getLocalStorage } from "@/utils/storage";

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
};

type PowerCurrent = {
  totalPower: number | null;
};

type Month = {
  id: number;
  powerNo: string;
  sYear: string;
  sMonth: string;
  remarks: string;
  decAcknow: boolean;
  disAcknow: boolean;
  revise: boolean;
  power?: Power;
  powerOriginal?: PowerOriginal;
  powerCurrent?: PowerCurrent;
  createdByUser?: UserAcKnow | null;
  decAcknowUser?: UserAcKnow | null;
  disAcknowUser?: UserAcKnow | null;
};

type User = {
  roleId: number;
  powers: { power: Power }[];
};

export default function MonthTable() {
  const now = new Date();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState<Month[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    now.getFullYear().toString(),
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (now.getMonth() + 1).toString().padStart(2, "0"),
  );
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedPowerId, selectedYear, selectedMonth]);

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

      let url = "";

      url = selectedPowerId
        ? `/monthpowers/alldocument?powerId=${selectedPowerId}&sYear=${selectedYear}&sMonth=${selectedMonth}`
        : `/monthpowers/alldocument?sYear=${selectedYear}&sMonth=${selectedMonth}`;

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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, "0");
    return { value: m, label: m };
  });

  const columns: ColumnDef<Month>[] = [
    {
      header: "MONTH/YEAR",
      cell: ({ row }) => {
        const sYear = row.original.sYear;
        const sMonth = row.original.sMonth;
        return `${sMonth}/${sYear}`;
      },
    },
    {
      accessorKey: "power.company.name",
      header: "COMPANY",
    },
    {
      accessorKey: "power.name",
      header: "DECLARATION",
    },
    {
      accessorKey: "powerNo",
      header: "MAD - MD",
      cell: ({ row }) => {
        const powerNo = row.original.powerNo;
        return `${powerNo} - EDL`;
      },
    },
    {
      accessorKey: "powerOriginal.totalPower",
      header: "MAD",
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value === null || value === undefined) return "-";
        return `${new Intl.NumberFormat("lo-LA").format(value)} MWh`;
      },
    },
    {
      accessorKey: "powerCurrent.totalPower",
      header: "MD",
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value === null || value === undefined) return "-";
        return `${new Intl.NumberFormat("lo-LA").format(value)} MWh`;
      },
    },
    {
      accessorKey: "revise",
      header: "DOCUMENT",
      cell: ({ getValue }) => {
        const value = getValue() as boolean;
        const isOriginal = value === false;

        return (
          <span
            className={`rounded-full px-2 py-1 text-sm font-medium ${
              isOriginal
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {isOriginal ? "original" : "revise"}
          </span>
        );
      },
    },
    {
      accessorKey: "decAcknow",
      header: "STATUS(MAD)",
      cell: ({ getValue, row }) => {
        const value = getValue() as boolean;
        const isOriginal = value === false;

        const firstname = row.original.decAcknowUser?.firstname ?? "";
        const lastname = row.original.decAcknowUser?.lastname ?? "";
        const userName = `${firstname} ${lastname}`.trim();

        return (
          <div className="group relative inline-block">
            <span
              className={`flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                isOriginal ? "text-red-700" : "text-green-700"
              }`}
            >
              {isOriginal ? (
                <XCircleIcon className="h-7 w-7" />
              ) : (
                <CheckCircleIcon className="h-7 w-7" />
              )}
            </span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {userName || "Not Acknowlege Yet"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "disAcknow",
      header: "STATUS(MD)",
      cell: ({ getValue, row }) => {
        const value = getValue() as boolean;
        const isOriginal = value === false;

        const firstname = row.original.disAcknowUser?.firstname ?? "";
        const lastname = row.original.disAcknowUser?.lastname ?? "";
        const userName = `${firstname} ${lastname}`.trim();

        return (
          <div className="group relative inline-block">
            <span
              className={`flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                isOriginal ? "text-red-700" : "text-green-700"
              }`}
            >
              {isOriginal ? (
                <XCircleIcon className="h-7 w-7" />
              ) : (
                <CheckCircleIcon className="h-7 w-7" />
              )}
            </span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {userName || "Not Acknowlege Yet"}
            </div>
          </div>
        );
      },
    },
    {
      header: "CREATED BY",
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
                    `/${user?.roleId === 3 || user?.roleId === 4 ? "alldocument/edl" : "alldocument/power"}/month/monthview/${encryptId(row.original.id)}`,
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
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
        <div className="mb-5 flex flex-col items-center gap-3 md:flex-row">
          <div className="w-full md:w-1/3">
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
          <div className="w-full md:w-1/5">
            <Label>Choose Year</Label>
            <div className="relative">
              <SelectDate
                options={yearOptions}
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          <div className="w-full md:w-1/5">
            <Label>Choose Month</Label>
            <div className="relative">
              <Select
                options={monthOptions}
                value={selectedMonth}
                placeholder="Select All Month"
                onChange={(value) => setSelectedMonth(value)}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </div>
        <hr />

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
              <thead className="bg-gray-100 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer px-4 py-4 text-left whitespace-nowrap select-none"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc"
                          ? " 🔼"
                          : header.column.getIsSorted() === "desc"
                            ? " 🔽"
                            : ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="text-sm text-gray-700 dark:text-gray-300">
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
