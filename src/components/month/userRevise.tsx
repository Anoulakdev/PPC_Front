"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import { decryptId } from "@/lib/cryptoId";

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

type ReviseTurbine = {
  turbine: number;
  hourly: number[];
};

type MonthReviseData = {
  remark: string;
  remarks: string[];
  reviseTurbines: ReviseTurbine[];
};

export default function UserRevise() {
  const { id } = useParams();
  const [data, setData] = useState<MonthReviseData | null>(null);
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
          `/monthpowers/monthrevise/${decryptedId}`,
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
        Monthly Availability Declaration (User Revise)
      </h1>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Time Of Day (Hrs)
                  </th>
                  {data?.reviseTurbines.map((turbine) => (
                    <th
                      key={`header-${turbine.turbine}`}
                      className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700"
                    >
                      Day-{turbine.turbine} (MW)
                    </th>
                  ))}
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Total (MWh)
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 24 }, (_, hourIdx) => {
                  const rowTotal =
                    data.reviseTurbines.reduce((sum, turbine) => {
                      return sum + (turbine.hourly[hourIdx] ?? 0);
                    }, 0) ?? 0;

                  const remark = data.remarks?.[hourIdx] || "";

                  return (
                    <tr key={hourIdx}>
                      <td className="border px-2 py-1 text-center whitespace-nowrap">
                        {hours[hourIdx]}
                      </td>

                      {/* Hourly values per turbine */}
                      {data.reviseTurbines.map((turbine) => (
                        <td
                          key={`unit-${turbine.turbine}-hour-${hourIdx}`}
                          className="border px-2 py-1 text-center whitespace-nowrap"
                        >
                          {turbine.hourly[hourIdx]?.toFixed(2) ?? "0.00"}
                        </td>
                      ))}

                      {/* Row total */}
                      <td className="border bg-gray-50 px-2 py-1 text-center font-semibold whitespace-nowrap dark:bg-gray-800">
                        {rowTotal.toFixed(2)}
                      </td>

                      {/* Remark */}
                      <td className="border px-2 py-1 text-left whitespace-nowrap">
                        {remark}
                      </td>
                    </tr>
                  );
                })}
                {/* Total row */}
                <tr className="bg-gray-50 py-2 font-bold whitespace-nowrap dark:bg-gray-800">
                  <td className="border p-2 text-center">Total (MWh)</td>
                  {data?.reviseTurbines.map((turbine) => {
                    const total = turbine.hourly.reduce(
                      (sum: number, v: number) => sum + v,
                      0,
                    );
                    return (
                      <td
                        key={`total-${turbine.turbine}`}
                        className="border p-2 text-center"
                      >
                        {new Intl.NumberFormat("lo-LA").format(total)} MWh
                      </td>
                    );
                  })}
                  <td className="border p-2 text-center">
                    {new Intl.NumberFormat("lo-LA").format(
                      data?.reviseTurbines.reduce(
                        (grand: number, t) =>
                          grand +
                          t.hourly.reduce((s: number, v: number) => s + v, 0),
                        0,
                      ),
                    )}{" "}
                    MWh
                  </td>
                  <td className="border p-2 text-center"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <textarea
              name="remark"
              id="remark"
              rows={3}
              value={data?.remark || ""}
              className="w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-gray-700 dark:border-gray-700 dark:bg-white/[0.05] dark:text-white/70"
              disabled
            ></textarea>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500"></div>
      )}
    </div>
  );
}
