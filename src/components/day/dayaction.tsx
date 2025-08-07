"use client";

import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useParams, useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { toast } from "react-toastify";
import { decryptId, encryptId } from "@/lib/cryptoId";
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

type Turbine = {
  turbine: number;
  hourly: number[];
  remarks: string[];
};

type CurrentPower = {
  remark: string;
  remarks: string[];
  currentTurbines: Turbine[];
};

type MachineAvailability = {
  maxs: number;
  mins: number;
  turbine: number;
};

type DayPowerData = {
  id: number;
  powerDate?: string;
  turbineDischargeamount?: number | string;
  turbineDischargeaverage?: number | string;
  spillwayDischargeamount?: number | string;
  spillwayDischargeaverage?: number | string;
  ecologicalDischargeamount?: number | string;
  ecologicalDischargeaverage?: number | string;
  upstreamLevel?: number | string;
  downstreamLevel?: number | string;
  totalStorageamount?: number | string;
  totalStorageaverage?: number | string;
  activeStorageamount?: number | string;
  activeStorageaverage?: number | string;
  powerCurrent?: CurrentPower;
  machinesAvailability: MachineAvailability[];
  decAcknow?: boolean;
  disAcknow?: boolean;
};

type User = {
  roleId: number;
};

export default function DayAction() {
  const { id } = useParams();
  const [data, setData] = useState<DayPowerData | null>(null);
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
        const response = await axiosInstance.get(`/daypowers/${decryptedId}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const totalDischarge = useMemo(() => {
    const tdAmount =
      parseFloat((data?.turbineDischargeamount ?? "").toString()) || 0;
    const tdAverage =
      parseFloat((data?.turbineDischargeaverage ?? "").toString()) || 0;
    const sdAmount =
      parseFloat((data?.spillwayDischargeamount ?? "").toString()) || 0;
    const sdAverage =
      parseFloat((data?.spillwayDischargeaverage ?? "").toString()) || 0;
    const edAmount =
      parseFloat((data?.ecologicalDischargeamount ?? "").toString()) || 0;
    const edAverage =
      parseFloat((data?.ecologicalDischargeaverage ?? "").toString()) || 0;

    return {
      amount: tdAmount + sdAmount + edAmount,
      average: tdAverage + sdAverage + edAverage,
    };
  }, [
    data?.turbineDischargeamount,
    data?.turbineDischargeaverage,
    data?.spillwayDischargeamount,
    data?.spillwayDischargeaverage,
    data?.ecologicalDischargeamount,
    data?.ecologicalDischargeaverage,
  ]);

  // แปลง powerDate เป็น Date
  const isReviseDisabled = useMemo(() => {
    if (!data?.powerDate) return true;

    const powerDate = new Date(data.powerDate);
    powerDate.setHours(0, 0, 0, 0); // ตัดเวลา

    // เพิ่มอีก 2 วันจาก powerDate
    const maxDate = new Date(powerDate);
    maxDate.setDate(maxDate.getDate() + 2); // powerDate + 2

    const today = new Date();
    today.setHours(0, 0, 0, 0); // เปรียบเทียบแค่วันที่

    return today > maxDate; // ถ้าวันนี้มากกว่า powerDate + 2 → disable
  }, [data?.powerDate]);

  const handleAcknowledge = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/daypowers/acknowleged/${data?.id}`);

      toast.success("Acknowledged successfully");
      const redirectPath =
        user?.roleId === 4
          ? "/dispatch/day"
          : user?.roleId === 6
            ? "/declaration/day"
            : null;

      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Acknowledge error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-4 flex items-center justify-between gap-4">
        {(user?.roleId === 4 || user?.roleId === 6) && (
          <button
            onClick={() =>
              router.push(
                `/${user.roleId === 4 ? "dispatch" : "declaration"}/day`,
              )
            }
            className="flex items-center gap-1 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        )}

        <h1 className="text-center text-xl font-bold">
          Daily Availability {user?.roleId === 4 ? "Dispatch" : "Declaration"}
        </h1>

        {(user?.roleId === 4 || user?.roleId === 6) && (
          <button
            onClick={() => {
              if (data?.id != null) {
                router.push(
                  `/${user.roleId === 4 ? "dispatch" : "declaration"}/day/revise/${encryptId(data.id)}`,
                );
              }
            }}
            disabled={isReviseDisabled}
            className={`flex items-center gap-1 rounded-md px-4 py-2 text-sm text-white ${
              isReviseDisabled
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <PencilIcon className="h-4 w-4" /> revise
          </button>
        )}
      </div>
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
                  {data.powerCurrent?.currentTurbines.map((turbine) => (
                    <th
                      key={`header-${turbine.turbine}`}
                      className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700"
                    >
                      Unit {turbine.turbine} (MW)
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

                  const remark = data.powerCurrent?.remarks?.[hourIdx] || "";

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
                <tr className="bg-gray-50 font-bold dark:bg-gray-800">
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
                        (grand: number, t: Turbine) =>
                          grand + t.hourly.reduce((s, v) => s + v, 0),
                        0,
                      ) || 0,
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
              value={data.powerCurrent?.remark || ""}
              className="w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-gray-700 dark:border-gray-700 dark:bg-white/[0.05] dark:text-white/70"
              disabled
            ></textarea>
          </div>

          <h1 className="py-8 text-center text-xl font-bold">
            Daily Availability
          </h1>

          <h2 className="mb-2 text-sm font-bold">1. Reservoir Situation.</h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Upstream Level (masl)</Label>
              <Input
                type="text"
                name="upstreamLevel"
                value={data.upstreamLevel || ""}
                disabled
                className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <Label>Downstream Level (masl)</Label>
              <Input
                type="text"
                name="downstreamLevel"
                value={data.downstreamLevel || ""}
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
                  <Label>Amount (MCM)</Label>
                  <Input
                    type="text"
                    name="totalStorageamount"
                    value={data.totalStorageamount || ""}
                    disabled
                    className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label>Percent ( % )</Label>
                  <Input
                    type="text"
                    name="totalStorageaverage"
                    value={data.totalStorageaverage || ""}
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
                  <Label>Amount (MCM)</Label>
                  <Input
                    type="text"
                    name="activeStorageamount"
                    value={data.activeStorageamount || ""}
                    disabled
                    className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label>Percent ( % )</Label>
                  <Input
                    type="text"
                    name="activeStorageaverage"
                    value={data.activeStorageaverage || ""}
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
                  <Label>Amount (MCM)</Label>
                  <Input
                    type="text"
                    name="turbineDischargeamount"
                    value={data.turbineDischargeamount || ""}
                    disabled
                    className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label>Average (m³/s)</Label>
                  <Input
                    type="text"
                    name="turbineDischargeaverage"
                    value={data.turbineDischargeaverage || ""}
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
                  <Label>Amount (MCM)</Label>
                  <Input
                    type="text"
                    name="spillwayDischargeamount"
                    value={data.spillwayDischargeamount || ""}
                    disabled
                    className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label>Average (m³/s)</Label>
                  <Input
                    type="text"
                    name="spillwayDischargeaverage"
                    value={data.spillwayDischargeaverage || ""}
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
                  <Label>Amount (MCM)</Label>
                  <Input
                    type="text"
                    name="ecologicalDischargeamount"
                    value={data.ecologicalDischargeamount || ""}
                    disabled
                    className="cursor-not-allowed bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label>Average (m³/s)</Label>
                  <Input
                    type="text"
                    name="ecologicalDischargeaverage"
                    value={data.ecologicalDischargeaverage || ""}
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
                  <Label>Amount (MCM)</Label>
                  <Input
                    type="text"
                    disabled
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={` ${totalDischarge.amount.toFixed(2)} MCM `}
                  />
                </div>

                <div>
                  <Label>Average (m³/s)</Label>
                  <Input
                    type="text"
                    disabled
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={`${totalDischarge.average.toFixed(2)} m³/s`}
                  />
                </div>
              </div>
            </div>
          </div>

          <h2 className="mt-6 mb-2 text-sm font-bold">
            3. Machines Availability.
          </h2>

          <div className="overflow-x-auto rounded-lg">
            <table className="table-auto border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left font-bold"></th>
                  {data?.machinesAvailability.map((m) => (
                    <th
                      key={m.turbine}
                      className="w-[130px] px-4 py-3 text-center whitespace-nowrap"
                    >
                      Unit-{m.turbine} (MW)
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
      {(user?.roleId === 4 || user?.roleId === 6) && (
        <button
          onClick={handleAcknowledge}
          disabled={
            loading || (user.roleId === 4 ? data?.disAcknow : data?.decAcknow)
          }
          className={`mt-6 w-full rounded-md px-4 py-2 text-lg text-white ${
            loading || (user.roleId === 4 ? data?.disAcknow : data?.decAcknow)
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading
            ? user.roleId === 4
              ? "Acknowledge Dispatch..."
              : "Acknowledge Declaration..."
            : user.roleId === 4
              ? "Acknowledge Dispatch"
              : "Acknowledge Declaration"}
        </button>
      )}
    </div>
  );
}
