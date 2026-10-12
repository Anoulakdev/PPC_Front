"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  PaginationState,
  ColumnDef,
} from "@tanstack/react-table";
import { useState, useEffect, useCallback } from "react";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";

type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roleId: number;
  phone: string;
  isActive: string;
  isOnline: boolean;
  userimg: string;
  company: Company;
  role: Role;
  powers: {
    power?: Power;
  }[];
};

type Role = {
  id: number;
  name: string;
};

type Power = {
  id: number;
  name: string;
};

type Company = {
  id: number;
  name: string;
};

export default function UserTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [resetId, setResetId] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) =>
        prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(pagination.pageIndex + 1));
      params.append("limit", String(pagination.pageSize));
      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      const response = await axiosInstance.get(
        `/users/admin?${params.toString()}`,
      );
      if (response.data && Array.isArray(response.data.data)) {
        const users = response.data.data;
        const totalCount = response.data.total ?? users.length;
        const pagesCount = response.data.totalPages ?? 1;
        setData(users);
        setTotal(totalCount);
        setTotalPages(pagesCount);

        if (users.length === 0 && pagination.pageIndex > 0 && totalCount > 0) {
          setPagination((prev) => ({
            ...prev,
            pageIndex: Math.max(0, pagesCount - 1),
          }));
        }
      } else if (Array.isArray(response.data)) {
        setData(response.data);
        setTotal(response.data.length);
        setTotalPages(1);
      } else {
        setData([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const openResetModal = (id: number) => {
    setResetId(id);
    setIsResetModalOpen(true);
  };
  const closeResetModal = () => {
    setIsResetModalOpen(false);
    setResetId(null);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/users/${deleteId}`);
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

  const handleReset = async () => {
    if (resetId === null) return;
    try {
      setLoading(true);
      await axiosInstance.put(`/users/resetpassword/${resetId}`);
      await fetchData();
      toast.success("reset password successfully!");
    } catch (error) {
      console.error("Reset failed:", error);
      toast.error("Reset failed!");
    } finally {
      closeResetModal();
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "A" ? "C" : "A";
    try {
      await axiosInstance.put(`/users/updatestatus/${id}?actived=${newStatus}`);
      await fetchData();
      toast.success("update status successfully!");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      header: "No",
      cell: ({ row, table }) =>
        table.getState().pagination.pageIndex *
          table.getState().pagination.pageSize +
        row.index +
        1,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={user.isActive === "A"}
              onChange={() => handleStatusChange(user.id, user.isActive)}
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 peer-focus:outline-none after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
          </label>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorFn: (row) => `${row.firstname} ${row.lastname}`,
      header: "Name",
    },
    {
      accessorKey: "role.name",
      header: "Role",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "company.name",
      header: "Company",
    },
    {
      header: "Power",
      accessorFn: (row) => row.powers.map((p) => p.power?.name).filter(Boolean),
      cell: ({ getValue }) => {
        const powerNames = getValue() as string[];
        return (
          <ul className="list-inside list-disc text-sm text-gray-700 dark:text-gray-200">
            {powerNames.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "userimg",
      header: "Image",
      cell: ({ row }) => {
        const user = row.original;
        const imageUrl = user.userimg
          ? `${process.env.NEXT_PUBLIC_API_URL}/upload/user/${user.userimg}`
          : "/nophoto.jpg";

        return (
          <Image
            src={imageUrl}
            alt={user.userimg || "No Image"}
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
            onClick={() => openResetModal(row.original.id)}
            className="rounded p-1 text-orange-600 hover:bg-red-100"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
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
    pageCount: Math.max(1, totalPages),
    manualPagination: true,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg transition-colors dark:bg-gray-800 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={openAddModal}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add User
          </button>

          <div className="relative max-w-xs md:w-full">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setDebouncedSearch(search);
                  setPagination((prev) =>
                    prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
                  );
                }
              }}
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
              <thead className="bg-gray-100 text-lg text-gray-700 dark:bg-gray-700 dark:text-gray-100">
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
              page {pagination.pageIndex + 1} of {Math.max(1, totalPages)}
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
              value={pagination.pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPagination({ pageIndex: 0, pageSize: newSize });
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
                if (total === 0) return "0 - 0 of 0";
                const start = pagination.pageIndex * pagination.pageSize + 1;
                const end = Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  total,
                );
                return `${start} - ${end} of ${total}`;
              })()}
            </div>
          </div>
        </div>
      </div>

      <AddUser
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onAdd={handleAdd}
      />

      <EditUser
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

      {isResetModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-semibold text-orange-600">
              Confirm Reset Password
            </h2>
            <p className="mb-4 text-gray-700">
              Are you want to reset password?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeResetModal}
                className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
