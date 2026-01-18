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
import { ChevronDownIcon } from "../../icons";
import moment from "moment";
// import { useRouter } from "next/navigation";
// import { encryptId } from "@/lib/cryptoId";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePickerAll from "@/components/form/date-pickerall";
import { TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

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
  upstreamLevel: string;
  downstreamLevel: string;
  totalStorageamount: string;
  totalStorageaverage: string;
  activeStorageamount: string;
  activeStorageaverage: string;
  turbineDischargeamount: string;
  turbineDischargeaverage: string;
  spillwayDischargeamount: string;
  spillwayDischargeaverage: string;
  ecologicalDischargeamount: string;
  ecologicalDischargeaverage: string;
  totalDischargeamount: string;
  totalDischargeaverage: string;
};

type PowerCurrent = {
  totalPower: number | string | null;
  upstreamLevel: string;
  downstreamLevel: string;
  totalStorageamount: string;
  totalStorageaverage: string;
  activeStorageamount: string;
  activeStorageaverage: string;
  turbineDischargeamount: string;
  turbineDischargeaverage: string;
  spillwayDischargeamount: string;
  spillwayDischargeaverage: string;
  ecologicalDischargeamount: string;
  ecologicalDischargeaverage: string;
  totalDischargeamount: string;
  totalDischargeaverage: string;
};

type Day = {
  id: number;
  powerNo: string;
  powerDate: string;
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

export default function DayTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState<Day[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [powerDate, setPowerDate] = useState<Date>(new Date());

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  //   const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [selectedPowerId, powerDate]);

  useEffect(() => {
    const fetchPowerList = async () => {
      try {
        const response = await axiosInstance.get(`/powers/selectpower`);
        setPowerList(response.data);
      } catch (error) {
        console.error("Error fetching power list:", error);
      }
    };

    fetchPowerList();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const formattedDate = moment(powerDate).format("YYYY-MM-DD");

      const url = selectedPowerId
        ? `/daypowers/admindaily?powerId=${selectedPowerId}&powerDate=${formattedDate}`
        : `/daypowers/admindaily?powerDate=${formattedDate}`;

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

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/daypowers/${deleteId}`);
      await fetchData();
      toast.success("Deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Delete failed!");
    } finally {
      closeDeleteModal();
      setLoading(false);
    }
  };

  const columns: ColumnDef<Day>[] = [
    {
      accessorKey: "powerDate",
      header: "DATE",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return moment(value).format("DD/MM/YYYY");
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
      header: "DAD - DD",
      cell: ({ row }) => {
        const powerNo = row.original.powerNo;
        return `${powerNo} - EDL`;
      },
    },
    {
      accessorKey: "powerOriginal.totalPower",
      header: "DAILY DECLARATION",
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value === null || value === undefined) return "-";
        return `${new Intl.NumberFormat("lo-LA").format(value)} MWh`;
      },
    },
    {
      accessorKey: "powerCurrent.totalPower",
      header: "DAILY DISPATCH",
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
      header: "STATUS(DAD)",
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
          </div>
        );
      },
    },
    {
      accessorKey: "disAcknow",
      header: "STATUS(DD)",
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
      header: "ACTION",
      cell: ({ row }) => (
        <button
          onClick={() => openDeleteModal(row.original.id)}
          className="rounded p-1 text-red-600 hover:bg-red-100"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
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
  });

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

          <div className="w-full md:w-1/4">
            <DatePickerAll
              id="powerDate"
              label="Select Date"
              defaultDate={powerDate ?? undefined}
              onChange={(dates) => {
                const selected = dates?.[0] ?? null;
                setPowerDate(selected);
              }}
            />
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
            </table>
          </div>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-semibold text-red-600">
              Confirm Delete
            </h2>
            <p className="mb-4 text-gray-700">Are you want to delete?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
