"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import { decryptId } from "@/lib/cryptoId";

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

type ReviseTurbine = {
  thead: string;
  unit: string;
  tbody: number[];
};

type YearReviseData = {
  reviseTurbines: ReviseTurbine[];
  yearRevise?: {
    yearPower?: {
      sYear: string;
    };
  };
};

export default function UserRevise() {
  const { id } = useParams();
  const [data, setData] = useState<YearReviseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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
        const response = await axiosInstance.get(
          `/yearpowers/yearrevise/${decryptedId}`,
        );
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
      <h1 className="mb-5 text-center text-xl font-bold">
        Yearly Availability Declaration (User Revise)
      </h1>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="overflow-x-auto overflow-y-auto">
            <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
              <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800">
                <tr className="bg-gray-100 text-sm dark:bg-gray-800">
                  <th
                    className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700"
                    rowSpan={2}
                  >
                    Month
                  </th>
                  {data?.reviseTurbines.map((col, idx) => (
                    <th key={idx} className="border p-2 text-center">
                      {col.thead}
                    </th>
                  ))}
                </tr>
                <tr className="text-center text-xs">
                  {data?.reviseTurbines.map((col, idx) => (
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

                    {data?.reviseTurbines.map((col, cIdx) => (
                      <td key={cIdx} className="border p-1 text-center text-sm">
                        {col.tbody[rIdx] !== undefined
                          ? col.tbody[rIdx].toFixed(2)
                          : "-"}
                      </td>
                    ))}
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
