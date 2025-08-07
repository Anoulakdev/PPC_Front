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
import AddPower from "./AddPower";
import EditPower from "./EditPower";
import type { ColumnDef } from "@tanstack/react-table";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";

type Power = {
  id: number;
  name: string;
  unit: number;
  abbreviation: string;
  isActive: string;
  address: string;
  installCapacity: string;
  baseEnergy: string;
  fullLevel: string;
  deadLevel: string;
  totalStorageFull: string;
  totalStorageDead: string;
  totalActiveFull: string;
  totalActiveDead: string;
  powerimg: string;
  company: Company;
  contract: Contract;
};

type Company = {
  id: number;
  name: string;
  address: string;
  phone: string;
};

type Contract = {
  id: number;
  name: string;
};

export default function CompanyTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState<Power[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/powers`);
      setData(response.data);
    } catch (err) {
      console.error("Error loading powers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAdd = async () => {
    try {
      await fetchData();
      toast.success("Added successfully!");
    } catch {
      toast.error("Add failed!");
    } finally {
      closeAddModal();
    }
  };

  const openEditModal = (id: number) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleUpdate = async () => {
    try {
      await fetchData();
      toast.success("Updated successfully!");
    } catch {
      toast.error("Update failed!");
    } finally {
      closeEditModal();
    }
  };

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
      await axiosInstance.delete(`/powers/${deleteId}`);
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

  const columns: ColumnDef<Power>[] = [
    {
      header: "No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "company.name",
      header: "Company",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => (
        <div className="w-full text-center">{row.original?.unit}</div>
      ),
    },
    {
      accessorKey: "abbreviation",
      header: "Abbreviation",
      cell: ({ row }) => (
        <div className="w-full text-center">{row.original?.abbreviation}</div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="w-full text-center">{row.original?.address}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "installCapacity",
      header: () => <div className="w-full text-center">Install Capacity</div>,
      cell: ({ row }) => (
        <div className="w-full text-center">
          {row.original?.installCapacity}
        </div>
      ),
    },
    {
      accessorKey: "baseEnergy",
      header: () => <div className="w-full text-center">Base Energy</div>,
      cell: ({ row }) => (
        <div className="w-full text-center">{row.original?.baseEnergy}</div>
      ),
    },
    {
      accessorKey: "fullLevel",
      header: () => <div className="w-full text-center">Full Level</div>,
      cell: ({ row }) => (
        <div className="w-full text-center">{row.original?.fullLevel}</div>
      ),
    },
    {
      accessorKey: "deadLevel",
      header: () => <div className="w-full text-center">Dead Level</div>,
      cell: ({ row }) => (
        <div className="w-full text-center">{row.original?.deadLevel}</div>
      ),
    },
    {
      accessorKey: "contract.name",
      header: "Contract",
      cell: ({ row }) => (
        <div className="w-full text-center">{row.original?.contract?.name}</div>
      ),
    },
    {
      accessorKey: "powerimg",
      header: "Image",
      cell: ({ row }) => {
        const power = row.original;
        const imageUrl = power.powerimg
          ? `${process.env.NEXT_PUBLIC_API_URL}/upload/power/${power.powerimg}`
          : "/nophoto.jpg";

        return (
          <Image
            src={imageUrl}
            alt={power.powerimg || "No Image"}
            width={90}
            height={90}
            className="rounded-lg border object-cover shadow-md"
          />
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row.original.id)}
            className="rounded p-1 text-blue-600 hover:bg-blue-100"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => openDeleteModal(row.original.id)}
            className="rounded p-1 text-red-600 hover:bg-red-100"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg transition-colors dark:bg-gray-800 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={openAddModal}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add Power
          </button>

          <div className="relative max-w-xs md:w-full">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full rounded-lg border text-left">
              <thead className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer px-5 py-4 text-left whitespace-nowrap select-none"
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
              <tbody className="text-sm text-gray-700">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-2 whitespace-nowrap dark:text-gray-200"
                      >
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

      <AddPower
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onAdd={handleAdd}
      />

      <EditPower
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdate={handleUpdate}
        id={selectedId}
      />

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
