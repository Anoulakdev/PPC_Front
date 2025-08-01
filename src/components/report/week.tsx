/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import type { ColumnDef } from "@tanstack/react-table";
// import { EyeIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "../../icons";
// import { useRouter } from "next/navigation";
// import { encryptId } from "@/lib/cryptoId";
import { getLocalStorage } from "@/utils/storage";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import SelectDate from "@/components/form/SelectDate";
import { getCurrentWeek, getWeeksInYear } from "@/utils/weeksInYear";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";

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
  totalPower: number | string | null;
};

type PowerCurrent = {
  totalPower: number | string | null;
};

type Week = {
  id: number;
  powerNo: string;
  sYear: string;
  sWeek: string;
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
  //   const router = useRouter();

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
        ? `/reports/week?powerId=${selectedPowerId}&sYear=${selectedYear}&sWeek=${selectedWeek}`
        : `/reports/week?sYear=${selectedYear}&sWeek=${selectedWeek}`;

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

  const totalDAD = data.reduce((sum, row) => {
    const val =
      parseFloat((row.powerOriginal?.totalPower ?? "").toString()) || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalDD = data.reduce((sum, row) => {
    const val =
      parseFloat((row.powerCurrent?.totalPower ?? "").toString()) || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

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
              className={`flex items-center justify-center rounded-full px-2 py-1 text-sm font-medium ${
                isOriginal ? "text-red-700" : "text-black-700"
              }`}
            >
              {isOriginal ? "Not Acknowlege" : userName}
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
              className={`flex items-center justify-center rounded-full px-2 py-1 text-sm font-medium ${
                isOriginal ? "text-red-700" : "text-black-700"
              }`}
            >
              {isOriginal ? "Not Acknowlege" : userName}
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
    // {
    //   id: "actions",
    //   header: "Action",
    //   cell: ({ row }) => (
    //     <div className="flex gap-2">
    //       {(user?.roleId === 3 ||
    //         user?.roleId === 4 ||
    //         user?.roleId === 5 ||
    //         user?.roleId === 6) && (
    //         <div className="group relative inline-block">
    //           <button
    //             onClick={() =>
    //               router.push(
    //                 `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/week/weekview/${encryptId(row.original.id)}`,
    //               )
    //             }
    //             className="rounded p-1 text-gray-600 hover:bg-blue-100"
    //           >
    //             <EyeIcon className="h-5 w-5" />
    //           </button>
    //           <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
    //             View
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   ),
    // },
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
  });

  const exportToExcel = () => {
    if (data) {
      const worksheet = XLSX.utils.json_to_sheet(
        data.map((item, index) => ({
          No: index + 1,
          Year: item.sYear,
          Week: item.sWeek,
          Company: item.power?.company?.name ?? "",
          Declaration: item.power?.name ?? "",
          WAD_WD: `${item.powerNo} - EDL`,
          WAD: parseFloat(item.powerOriginal?.totalPower?.toString() ?? "0"),
          WD: parseFloat(item.powerCurrent?.totalPower?.toString() ?? "0"),
          Document: item.revise === false ? "Original" : "Revise",
          StatusWAD: item.decAcknowUser?.firstname
            ? `${item.decAcknowUser.firstname} ${item.decAcknowUser.lastname ?? ""}`.trim()
            : "Not Acknowlege",
          StatusWD: item.disAcknowUser?.firstname
            ? `${item.disAcknowUser.firstname} ${item.disAcknowUser.lastname ?? ""}`.trim()
            : "Not Acknowlege",
          CreatedBy: `${item.createdByUser?.firstname ?? ""} ${
            item.createdByUser?.lastname ?? ""
          }`.trim(),
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, `Week_Report_${moment().format("DDMMYYYY_HHmmss")}.xlsx`);
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
          <div className="w-full md:w-1/6">
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

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border">
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
              <tfoot className="bg-gray-50 text-sm font-semibold whitespace-nowrap dark:bg-gray-800 dark:text-gray-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-sm">
                    Total
                  </td>
                  <td className="px-4 py-3">
                    {new Intl.NumberFormat("lo-LA").format(totalDAD)} MWh
                  </td>
                  <td className="px-4 py-3">
                    {new Intl.NumberFormat("lo-LA").format(totalDD)} MWh
                  </td>
                  <td colSpan={columns.length - 5}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
