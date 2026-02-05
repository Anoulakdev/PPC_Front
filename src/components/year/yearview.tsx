"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import moment from "moment";
import { decryptId, encryptId } from "@/lib/cryptoId";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { getLocalStorage } from "@/utils/storage";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type TurbineData = {
  thead: string;
  unit: string;
  tbody: number[];
};

type PowerOriginal = {
  id: number;
  yearPowerId: number;
  originalTurbines: TurbineData[];
};

type PowerCurrent = {
  id: number;
  yearPowerId: number;
  currentTurbines: TurbineData[];
};

type ReviseUser = {
  firstname: string;
  lastname: string;
  company: {
    name: string;
  };
};

type PowerRevise = {
  id: number;
  yearPowerId: number;
  reviseUserId: number;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  reviseUser: ReviseUser;
};

type YearPowerData = {
  id: number;
  powerId: number;
  powerNo: string;
  sYear: string;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  powerOriginal: PowerOriginal | null;
  powerCurrent: PowerCurrent | null;
  powerRevises: PowerRevise[];
  power: {
    id: number;
    name: string;
  };
};

type User = {
  roleId: number;
};

export default function YearView() {
  const { id } = useParams();
  const [data, setData] = useState<YearPowerData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let decryptedId: string;
        try {
          decryptedId = decryptId(decodeURIComponent(id as string));
        } catch {
          router.replace("/unauthorized");
          return;
        }
        const response = await axiosInstance.get(`/yearpowers/${decryptedId}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-7 flex items-center justify-between gap-4">
        {(user?.roleId === 3 ||
          user?.roleId === 4 ||
          user?.roleId === 5 ||
          user?.roleId === 6) && (
          <button
            onClick={() =>
              router.push(
                `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/year`,
              )
            }
            className="flex items-center gap-1 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        )}
        <div>
          <h1 className="text-center text-xl font-bold">
            Yearly Availability and Declaration
          </h1>
          <p className="text-center text-red-500">{data?.power?.name}</p>
        </div>
        <div className="text-md font-semibold text-red-600">{data?.sYear}</div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full overflow-x-auto rounded-lg lg:w-1/2">
              <div className="overflow-x-auto rounded-lg border">
                <div className="my-3 text-center text-xl font-bold">
                  Declaration
                </div>
                <div className="overflow-x-auto overflow-y-auto">
                  <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
                    <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800">
                      <tr className="bg-gray-100 text-xs dark:bg-gray-800">
                        <th
                          className="border p-2 text-center whitespace-nowrap dark:border-gray-700"
                          rowSpan={2}
                        >
                          Month
                        </th>
                        {data.powerOriginal?.originalTurbines.map(
                          (col, idx) => (
                            <th key={idx} className="border p-2 text-center">
                              {col.thead}
                            </th>
                          ),
                        )}
                      </tr>
                      <tr className="text-center text-xs">
                        {data.powerOriginal?.originalTurbines.map(
                          (col, idx) => (
                            <th key={idx} className="border p-2">
                              {col.unit}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {months.map((m, rIdx) => (
                        <tr key={m}>
                          <td className="sticky left-0 z-10 border bg-gray-100 p-2 text-center text-sm whitespace-nowrap dark:bg-gray-800">
                            {m}
                          </td>

                          {data.powerOriginal?.originalTurbines.map(
                            (col, cIdx) => (
                              <td
                                key={cIdx}
                                className="border p-1 text-center text-sm"
                              >
                                {col.tbody[rIdx] !== undefined
                                  ? col.tbody[rIdx].toFixed(2)
                                  : "-"}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto rounded-lg lg:w-1/2">
              <div className="overflow-x-auto rounded-lg border">
                <div className="my-3 text-center text-xl font-bold">
                  Dispatch
                </div>
                <div className="overflow-x-auto overflow-y-auto">
                  <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
                    <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800">
                      <tr className="bg-gray-100 text-xs dark:bg-gray-800">
                        <th
                          className="border p-2 text-center whitespace-nowrap dark:border-gray-700"
                          rowSpan={2}
                        >
                          Month
                        </th>
                        {data.powerCurrent?.currentTurbines.map((col, idx) => (
                          <th key={idx} className="border p-2 text-center">
                            {col.thead}
                          </th>
                        ))}
                      </tr>
                      <tr className="text-center text-xs">
                        {data.powerCurrent?.currentTurbines.map((col, idx) => (
                          <th key={idx} className="border p-2">
                            {col.unit}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {months.map((m, rIdx) => (
                        <tr key={m}>
                          <td className="sticky left-0 z-10 border bg-gray-100 p-2 text-center text-sm whitespace-nowrap dark:bg-gray-800">
                            {m}
                          </td>

                          {data.powerCurrent?.currentTurbines.map(
                            (col, cIdx) => (
                              <td
                                key={cIdx}
                                className="border p-1 text-center text-sm"
                              >
                                {col.tbody[rIdx] !== undefined
                                  ? col.tbody[rIdx].toFixed(2)
                                  : "-"}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <h1 className="pt-6 pb-6 text-center text-xl font-bold">
            User Revise
          </h1>

          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    No
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Firstname
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Lastname
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Company
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Date
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.powerRevises?.map((revise, index: number) => (
                  <tr key={revise.id}>
                    <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap dark:border-gray-700">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap dark:border-gray-700">
                      {revise.reviseUser.firstname}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap dark:border-gray-700">
                      {revise.reviseUser.lastname}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap dark:border-gray-700">
                      {revise.reviseUser.company?.name}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap dark:border-gray-700">
                      {moment(revise.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap dark:border-gray-700">
                      {(user?.roleId === 3 ||
                        user?.roleId === 4 ||
                        user?.roleId === 5 ||
                        user?.roleId === 6) && (
                        <button
                          onClick={() =>
                            window.open(
                              `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/year/userrevise/${encryptId(revise.id)}`,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="rounded bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500"></div>
      )}
    </div>
  );
}
