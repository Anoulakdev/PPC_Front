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
import moment from "moment";
import type { ColumnDef } from "@tanstack/react-table";
import {
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "../../icons";
import { useRouter } from "next/navigation";
import { encryptId } from "@/lib/cryptoId";
import { getLocalStorage } from "@/utils/storage";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import SelectDate from "@/components/form/SelectDate";
import { getCurrentWeek, getWeeksInYear } from "@/utils/weeksInYear";

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

type Week = {
  id: number;
  powerNo: string;
  sYear: string;
  sWeek: string;
  startDate: string;
  endDate: string;
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

export default function WeekTable() {
  const now = new Date();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState<Week[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(
    now.getFullYear().toString(),
  );
  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeek());
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedPowerId, selectedYear, selectedWeek]);

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
        ? `/weekpowers?powerId=${selectedPowerId}&sYear=${selectedYear}&sWeek=${selectedWeek}`
        : `/weekpowers?sYear=${selectedYear}&sWeek=${selectedWeek}`;

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

  const weekOptions = (() => {
    const year = parseInt(selectedYear, 10);
    const totalWeeks = getWeeksInYear(year);
    return Array.from({ length: totalWeeks }, (_, i) => {
      const w = (i + 1).toString().padStart(2, "0");
      return { value: w, label: w };
    });
  })();

  const columns: ColumnDef<Week>[] = [
    {
      accessorKey: "sYear",
      header: "YEAR",
    },
    {
      accessorKey: "sWeek",
      header: "WEEK",
    },
    {
      header: "DATE RANGE",
      cell: ({ row }) => {
        const startDate = moment(row.original?.startDate).format("DD/MM/YYYY");
        const endDate = moment(row.original?.endDate).format("DD/MM/YYYY");
        return `${startDate} - ${endDate}`;
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
      header: "WAD - WD",
      cell: ({ row }) => {
        const powerNo = row.original.powerNo;
        return `${powerNo} - EDL`;
      },
    },
    {
      accessorKey: "powerOriginal.totalPower",
      header: "WAD",
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value === null || value === undefined) return "-";
        return `${new Intl.NumberFormat("lo-LA").format(value)} MWh`;
      },
    },
    {
      accessorKey: "powerCurrent.totalPower",
      header: "WD",
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
      header: "STATUS(WAD)",
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
      header: "STATUS(WD)",
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
                    `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/week/weekview/${encryptId(row.original.id)}`,
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

          {(user?.roleId === 4 || user?.roleId === 6) && (
            <div className="group relative inline-block">
              <button
                onClick={() =>
                  router.push(
                    `/${user.roleId === 4 ? "dispatch" : "declaration"}/week/weekaction/${encryptId(row.original.id)}`,
                  )
                }
                className="rounded p-1 text-blue-600 hover:bg-red-100"
              >
                <CursorArrowRaysIcon className="h-5 w-5" />
              </button>
              <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Action
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

  const CreatePage = () => {
    router.push("/declaration/week/create");
  };

  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
        <div className="mb-3 flex flex-col items-center gap-3 md:flex-row">
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
            <Label>Choose Week</Label>
            <div className="relative">
              <Select
                options={weekOptions}
                value={selectedWeek}
                placeholder="Select All Week"
                onChange={(value) => setSelectedWeek(value)}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
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
              className="rounded border px-2 py-1 dark:bg-gray-700"
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
