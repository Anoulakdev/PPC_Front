"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import moment from "moment";
import { decryptId, encryptId } from "@/lib/cryptoId";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { getLocalStorage } from "@/utils/storage";

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
  totalDate: number;
  remark: string;
  remarks: string[];
  originalTurbines: TurbineData[];
};

type PowerCurrent = {
  id: number;
  dayPowerId: number;
  totalPower: number;
  totalDate: number;
  remark: string;
  remarks: string[];
  currentTurbines: TurbineData[];
};

type ReviseDetail = {
  totalPower: number;
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
  dayPowerId: number;
  reviseUserId: number;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  reviseDetail: ReviseDetail;
  reviseUser: ReviseUser;
};

type MonthPowerData = {
  id: number;
  powerId: number;
  powerNo: string;
  sYear: string;
  sMonth: string;
  remarks: string | null;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  powerOriginal: PowerOriginal | null;
  powerCurrent: PowerCurrent | null;
  powerRevises: PowerRevise[];
};

type User = {
  roleId: number;
};

type MonthViewProps = {
  onPowerIdChange?: (powerId: number) => void;
};

export default function MonthView({ onPowerIdChange }: MonthViewProps) {
  const { id } = useParams();
  const [data, setData] = useState<MonthPowerData | null>(null);
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
        const response = await axiosInstance.get(`/monthpowers/${decryptedId}`);
        setData(response.data);
        // ✅ ส่งค่า powerId กลับไปยัง parent
        if (onPowerIdChange && response.data?.powerId) {
          onPowerIdChange(response.data.powerId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, onPowerIdChange]);

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
                `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/month`,
              )
            }
            className="flex items-center gap-1 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        )}
        <h1 className="text-center text-xl font-bold">
          Monthly Availability and Declaration
        </h1>
        <div className="text-md font-semibold text-red-600">
          {data?.sMonth} / {data?.sYear}
        </div>
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
                        data.powerOriginal?.originalTurbines.reduce(
                          (sum, turbine) => {
                            return sum + (turbine.hourly[hourIdx] ?? 0);
                          },
                          0,
                        ) ?? 0;

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

                          {/* Row total */}
                          <td className="border bg-gray-50 px-2 py-1 text-center font-semibold whitespace-nowrap dark:bg-gray-800">
                            {new Intl.NumberFormat("lo-LA").format(rowTotal)}
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
                      <td className="border p-2 text-center">
                        {new Intl.NumberFormat("lo-LA").format(
                          data.powerOriginal?.originalTurbines.reduce(
                            (grand: number, t: TurbineData) =>
                              grand + t.hourly.reduce((s, v) => s + v, 0),
                            0,
                          ) || 0,
                        )}{" "}
                        MWh
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <textarea
                  name="remark"
                  id="remark"
                  rows={3}
                  value={data.powerOriginal?.remark || ""}
                  className="w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-gray-700 dark:border-gray-700 dark:bg-white/[0.05] dark:text-white/70"
                  disabled
                ></textarea>
              </div>
            </div>

            <div className="w-full overflow-x-auto rounded-lg lg:w-1/2">
              <div className="overflow-x-auto rounded-lg border">
                <div className="my-3 text-center text-xl font-bold">
                  Dispatch
                </div>
                <table className="min-w-full rounded-lg border text-left dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                        Time Of Day (Hrs)
                      </th>
                      {data.powerCurrent?.currentTurbines.map((turbine) => (
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
                        data.powerCurrent?.currentTurbines.reduce(
                          (sum, turbine) => {
                            return sum + (turbine.hourly[hourIdx] ?? 0);
                          },
                          0,
                        ) ?? 0;

                      const remark =
                        data.powerCurrent?.remarks?.[hourIdx] || "";

                      return (
                        <tr key={hourIdx}>
                          <td className="border px-2 py-1 text-center whitespace-nowrap">
                            {hours[hourIdx]}
                          </td>

                          {/* Hourly values per turbine */}
                          {data.powerCurrent?.currentTurbines.map((turbine) => (
                            <td
                              key={`unit-${turbine.turbine}-hour-${hourIdx}`}
                              className="border px-2 py-1 text-center whitespace-nowrap"
                            >
                              {turbine.hourly[hourIdx]?.toFixed(2) ?? "0.00"}
                            </td>
                          ))}

                          {/* Row total */}
                          <td className="border bg-gray-50 px-2 py-1 text-center font-semibold whitespace-nowrap dark:bg-gray-800">
                            {new Intl.NumberFormat("lo-LA").format(rowTotal)}
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
                      {data.powerCurrent?.currentTurbines.map((turbine) => {
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
                          data.powerCurrent?.currentTurbines.reduce(
                            (grand: number, t: TurbineData) =>
                              grand + t.hourly.reduce((s, v) => s + v, 0),
                            0,
                          ) || 0,
                        )}{" "}
                        MWh
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <textarea
                  name="remark"
                  id="remark"
                  rows={3}
                  value={data.powerCurrent?.remark || ""}
                  className="w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-gray-700 dark:border-gray-700 dark:bg-white/[0.05] dark:text-white/70"
                  disabled
                ></textarea>
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
                    Grand Total (MWh)
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
                      {revise.reviseDetail?.totalPower != null
                        ? new Intl.NumberFormat("lo-LA", {
                            maximumFractionDigits: 2,
                          }).format(revise.reviseDetail.totalPower)
                        : ""}
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
                              `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/month/userrevise/${encryptId(revise.id)}`,
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
