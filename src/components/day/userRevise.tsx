"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import { decryptId } from "@/lib/cryptoId";
import Label from "../form/Label";
import Input from "../form/input/InputField";

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

type DayReviseData = {
  turbineDischargeamount?: number | string;
  turbineDischargeaverage?: number | string;
  spillwayDischargeamount?: number | string;
  spillwayDischargeaverage?: number | string;
  ecologicalDischargeamount?: number | string;
  ecologicalDischargeaverage?: number | string;
  totalDischargeamount?: number | string;
  totalDischargeaverage?: number | string;
  upstreamLevel?: number | string;
  downstreamLevel?: number | string;
  totalStorageamount?: number | string;
  totalStorageaverage?: number | string;
  activeStorageamount?: number | string;
  activeStorageaverage?: number | string;
  machinesAvailability: MachineAvailability[];
  totalUnit: number;
  remark: string;
  remarks: string[];
  reviseTurbines: ReviseTurbine[];
  dayRevise: {
    dayPower: {
      power: {
        id: number;
        fuelId: number;
      };
    };
  };
};

type MachineAvailability = {
  maxs: number;
  mins: number;
  turbine: number;
};

export default function UserRevise() {
  const { id } = useParams();
  const [data, setData] = useState<DayReviseData | null>(null);
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
          `/daypowers/dayrevise/${decryptedId}`,
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

  const columnLabels = (() => {
    if (data?.dayRevise?.dayPower?.power?.fuelId === 3) {
      return ["Solar", "Battery"];
    }

    if (data?.dayRevise?.dayPower?.power?.fuelId === 2) {
      return ["Unit 1", "Unit 2", "Unit 3", "Surplus"];
    }

    const totalUnit = data?.totalUnit ?? 1;
    return Array.from({ length: totalUnit }, (_, i) => `Unit-${i + 1}`);
  })();

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
      <h1 className="mb-5 text-center text-xl font-bold">
        Daily Availability Declaration (User Revise)
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
                  {columnLabels.map((label, idx) => (
                    <th
                      key={`declaration-header-${idx}`}
                      className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700"
                    >
                      {label} (MW)
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
                <tr className="bg-gray-100 font-bold dark:bg-gray-800">
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

          {data?.dayRevise?.dayPower?.power?.fuelId === 1 && (
            <>
              <h1 className="py-6 text-center text-xl font-bold">
                Daily Availability
              </h1>

              <h2 className="mb-2 text-sm font-bold">
                1. Reservoir Situation (00:00)
              </h2>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Upstream Level (masl)</Label>
                  <Input
                    type="text"
                    name="upstreamLevel"
                    value={Number(data?.upstreamLevel).toLocaleString() || ""}
                    disabled
                    className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label>Downstream Level (masl)</Label>
                  <Input
                    type="text"
                    name="downstreamLevel"
                    value={Number(data?.downstreamLevel).toLocaleString() || ""}
                    disabled
                    className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold">* Total Storage</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="totalStorageamount"
                        value={
                          Number(data?.totalStorageamount).toLocaleString() ||
                          ""
                        }
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <Label>Percent ( % )</Label>
                      <Input
                        type="text"
                        name="totalStorageaverage"
                        // value={data.powerCurrent?.totalStorageaverage || ""}
                        value={`${Number(data?.totalStorageaverage ?? 0).toFixed(2)}`}
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold">* Active Storage</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="activeStorageamount"
                        value={
                          Number(data?.activeStorageamount).toLocaleString() ||
                          ""
                        }
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <Label>Percent ( % )</Label>
                      <Input
                        type="text"
                        name="activeStorageaverage"
                        // value={data.powerCurrent?.activeStorageaverage || ""}
                        value={`${Number(data?.activeStorageaverage ?? 0).toFixed(2)}`}
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="mt-6 mb-2 text-sm font-bold">
                2. Daily Water Discharge Plan.
              </h2>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold">* Turbine Discharge</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="turbineDischargeamount"
                        value={
                          Number(
                            data?.turbineDischargeamount,
                          ).toLocaleString() || ""
                        }
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="text"
                        name="turbineDischargeaverage"
                        value={
                          Number(
                            data?.turbineDischargeaverage,
                          ).toLocaleString() || ""
                        }
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold">* Spillway Discharge</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="spillwayDischargeamount"
                        value={
                          Number(
                            data?.spillwayDischargeamount,
                          ).toLocaleString() || ""
                        }
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="text"
                        name="spillwayDischargeaverage"
                        value={
                          Number(
                            data?.spillwayDischargeaverage,
                          ).toLocaleString() || ""
                        }
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold">* Ecological Discharge</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="ecologicalDischargeamount"
                        value={
                          Number(
                            data?.ecologicalDischargeamount,
                          ).toLocaleString() || ""
                        }
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="text"
                        name="ecologicalDischargeaverage"
                        value={
                          Number(
                            data?.ecologicalDischargeaverage,
                          ).toLocaleString() || ""
                        }
                        disabled
                        className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold">* Total Discharge</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        disabled
                        name="totalDischargeamount"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(data?.totalDischargeamount).toLocaleString() ||
                          ""
                        }
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="text"
                        disabled
                        name="totalDischargeaverage"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data?.totalDischargeaverage,
                          ).toLocaleString() || ""
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <h2 className="mt-6 mb-2 text-sm font-bold">
            3. Machines Availability.
          </h2>

          <div className="overflow-x-auto rounded-lg">
            <table className="table-auto border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left font-bold"></th>
                  {columnLabels.map((label, idx) => (
                    <th
                      key={`declaration-header-${idx}`}
                      className="w-[130px] px-4 py-3 text-center whitespace-nowrap"
                    >
                      {label} (MW)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
                    MAX
                  </td>
                  {data?.machinesAvailability.map((m) => (
                    <td
                      key={`max-${m.turbine}`}
                      className="px-4 py-2 text-center"
                    >
                      <input
                        type="text"
                        value={m.maxs}
                        disabled
                        className="w-[100px] cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-2 py-2 text-center dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
                    MIN
                  </td>
                  {data?.machinesAvailability.map((m) => (
                    <td
                      key={`min-${m.turbine}`}
                      className="px-4 py-2 text-center"
                    >
                      <input
                        type="text"
                        value={m.mins}
                        disabled
                        className="w-[100px] cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-2 py-2 text-center dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </td>
                  ))}
                </tr>
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
