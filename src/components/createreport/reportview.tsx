"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import { decryptId } from "@/lib/cryptoId";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { getLocalStorage } from "@/utils/storage";
import moment from "moment";

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

type TurbineData = {
  turbine: number;
  hourly: number[];
};

type PowerOriginal = {
  id: number;
  dayPowerId: number;
  totalPower: number;
  totalUnit: number;
  remarks: string[];
  originalTurbines: TurbineData[];
};

type Power = {
  id: number;
  name: string;
  company: {
    name: string;
  };
};

type CreateReportData = {
  id: number;
  powerId: number;
  powerDate: string;
  remarks: string | null;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  powerOriginal: PowerOriginal | null;
  power?: Power;
};

type User = {
  roleId: number;
};

export default function MonthView() {
  const { id } = useParams();
  const [data, setData] = useState<CreateReportData | null>(null);
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
        const response = await axiosInstance.get(`/dayreports/${decryptedId}`);
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
                `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/createreport`,
              )
            }
            className="flex items-center gap-1 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        )}
        <h1 className="text-center text-xl font-bold">Daily Operation</h1>
        <div className="text-md font-semibold text-red-600">
          {data?.powerDate ? moment(data.powerDate).format("DD/MM/YYYY") : ""}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full overflow-x-auto rounded-lg">
              <div className="overflow-x-auto rounded-lg border">
                <div className="my-3 text-center text-xl font-bold">
                  {data.power?.name}
                </div>
                <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                        Time Of Day (Hrs)
                      </th>
                      {data.powerOriginal?.originalTurbines.map((turbine) => (
                        <th
                          key={`header-${turbine.turbine}`}
                          className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700"
                        >
                          Total (MW)
                        </th>
                      ))}

                      <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 24 }, (_, hourIdx) => {
                      const remark =
                        data.powerOriginal?.remarks?.[hourIdx] || "";

                      return (
                        <tr key={hourIdx}>
                          <td className="border px-2 py-1 text-center whitespace-nowrap">
                            {hours[hourIdx]}
                          </td>

                          {/* Hourly values per turbine */}
                          {data.powerOriginal?.originalTurbines.map(
                            (turbine) => (
                              <td
                                key={`unit-${turbine.turbine}-hour-${hourIdx}`}
                                className="border px-2 py-1 text-center whitespace-nowrap"
                              >
                                {turbine.hourly[hourIdx]?.toFixed(2) ?? "0.00"}
                              </td>
                            ),
                          )}

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
                      {data.powerOriginal?.originalTurbines.map((turbine) => {
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
                      <td className="border p-2 text-center"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500"></div>
      )}
    </div>
  );
}
