/* eslint-disable @next/next/no-img-element */
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
import moment from "moment";
// import { useRouter } from "next/navigation";
// import { encryptId } from "@/lib/cryptoId";
import { getLocalStorage } from "@/utils/storage";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePickerAll from "@/components/form/date-pickerall";
import { saveAs } from "file-saver";
// import Image from "next/image";

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

type Day = {
  id: number;
  powerDate: string;
  power: Power;
  dayReportCurrents: {
    id: number;
    netEnergyOutput: string;
    createdByUser?: UserAcKnow | null;
  }[];
};

type User = {
  roleId: number;
  powers: { power: Power }[];
};

export default function DayTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState<Day[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalNetEnergy, setTotalNetEnergy] = useState<number>(0);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);
  //   const router = useRouter();

  const formatDate = (date: Date) => moment(date).format("YYYY-MM-DD");

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

  useEffect(() => {
    if (powerList.length > 0 && !selectedPowerId) {
      setSelectedPowerId(powerList[0].id.toString());
    }
  }, [powerList]);

  const fetchData = async () => {
    if (!selectedPowerId) return;
    try {
      setLoading(true);

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      const response = await axiosInstance.get(
        `/dayreports/sumnetenergy?powerId=${selectedPowerId}&startDate=${start}&endDate=${end}`,
      );

      setData(response.data.data ?? []);
      setTotalNetEnergy(Number(response.data.totalNetEnergy ?? 0));
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
      accessorKey: "power.company.name",
      header: "COMPANY",
    },
    {
      accessorKey: "power.name",
      header: "DECLARATION",
    },
    {
      accessorKey: "powerDate",
      header: "DATE",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return moment(value).format("DD/MM/YYYY");
      },
    },
    {
      header: "NET ENERGY OUTPUT (kWh)",
      cell: ({ row }) => {
        const total = row.original.dayReportCurrents.reduce(
          (sum, item) => sum + Number(item.netEnergyOutput || 0),
          0,
        );

        return `${new Intl.NumberFormat("lo-LA").format(total)}`;
      },
    },
    {
      header: "CREATED BY",
      cell: ({ row }) => {
        const user = row.original.dayReportCurrents?.[0]?.createdByUser;
        if (!user) return "-";
        return `${user.firstname ?? ""} ${user.lastname ?? ""}`;
      },
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
  });

  const exportToExcel = async () => {
    if (data) {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(
        data.map((item, index) => ({
          No: index + 1,
          Company: item.power?.company?.name ?? "",
          Declaration: item.power?.name ?? "",
          Date: moment(item.powerDate).format("DD/MM/YYYY"),
          "Net Energy Output (kWh)": item.dayReportCurrents.reduce(
            (sum, current) => sum + Number(current.netEnergyOutput || 0),
            0,
          ),
          "Created By": item.dayReportCurrents?.[0]?.createdByUser
            ? `${item.dayReportCurrents?.[0]?.createdByUser?.firstname ?? ""} ${item.dayReportCurrents?.[0]?.createdByUser?.lastname ?? ""}`
            : "",
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
      saveAs(
        blob,
        `Net_Energy_Output_Report_${moment().format("DDMMYYYY_HHmmss")}.xlsx`,
      );
    }
  };

  const exportToPDF = () => {
    const params = new URLSearchParams({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      powerId: selectedPowerId ?? "",
    }).toString();

    const url = `/api/report/pdf/netenergyoutput?${params}`;
    window.open(url, "_blank");
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

          <div className="flex gap-2 self-start md:mt-6">
            <button
              onClick={exportToExcel}
              disabled={loading || data.length === 0}
              // className={`rounded-md bg-green-500 px-4 py-2 text-lg text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-500`}
            >
              <img width={45} height={45} src="/excel.png" alt="Excel" />
            </button>

            <button
              onClick={exportToPDF}
              disabled={loading || data.length === 0}
              // className={`rounded-md bg-red-500 px-4 py-2 text-lg text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-500`}
            >
              <img width={45} height={45} src="/pdf.png" alt="PDF" />
            </button>
          </div>
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
                  <td colSpan={3} className="px-4 py-3 text-center text-sm">
                    Total
                  </td>
                  <td className="px-4 py-3">
                    {new Intl.NumberFormat("lo-LA").format(totalNetEnergy)} kWh
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
