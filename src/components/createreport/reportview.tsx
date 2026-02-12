"use client";

import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import { decryptId, encryptId } from "@/lib/cryptoId";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { getLocalStorage } from "@/utils/storage";
import moment from "moment";
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

type TurbineData = {
  turbine: number;
  hourly: number[];
};

type UserAcKnow = {
  firstname: string;
  lastname: string;
};

type Power = {
  id: number;
  name: string;
  fuelId: number;
  company: {
    name: string;
  };
};

type PowerCurrent = {
  totalPower: number | null;
  remarks: string;
  originalTurbines: TurbineData[];
};

type DayReportCurrent = {
  activeStorageamount: string;
  activeStorageaverage: string;
  waterLevel: string;
  dwy: string;
  dwf: string;
  dwm: string;
  pws: string;
  inflowamount: string;
  inflowaverage: string;
  tdAmount: string;
  tdAverage: string;
  spillwayamount: string;
  spillwayaverage: string;
  owramount: string;
  owraverage: string;
  rainFall: string;
  powerGeneration: string;
  netEnergyImport: string;
  netEnergyOutput: string;
  waterRate: string;
  totalOutflow: string;
  averageOutflow: string;
  createdByUser?: UserAcKnow | null;
  powerCurrent?: PowerCurrent;
};

type DayReportHistory = {
  id: number;
  createdByUser?: UserAcKnow | null;
  totalPower: number | null;
  createdAt: string;
};

type CreateReportData = {
  id: number;
  powerDate: string;
  power?: Power;
  dayReportCurrent: DayReportCurrent;
  dayReportHistorys: DayReportHistory;
};

type User = {
  roleId: number;
};

export default function ReportView() {
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

  // แปลง powerDate เป็น Date
  const isReviseDisabled = useMemo(() => {
    if (!data?.powerDate) return true;

    const powerDate = new Date(data.powerDate);
    powerDate.setHours(0, 0, 0, 0); // ตัดเวลา

    // เพิ่มอีก 5 วันจาก powerDate
    const maxDate = new Date(powerDate);
    maxDate.setDate(maxDate.getDate() + 5); // powerDate + 5

    const today = new Date();
    today.setHours(0, 0, 0, 0); // เปรียบเทียบแค่วันที่

    return today > maxDate; // ถ้าวันนี้มากกว่า powerDate + 5 → disable
  }, [data?.powerDate]);

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
        <h1 className="text-center text-xl font-bold">
          Daily Operation{" "}
          <span className="text-red-700">
            (
            {data?.powerDate ? moment(data.powerDate).format("DD/MM/YYYY") : ""}
            )
          </span>
        </h1>
        {user?.roleId === 6 ? (
          <button
            onClick={() => {
              if (data?.id != null) {
                router.push(
                  `/declaration/createreport/revise/${encryptId(data.id)}`,
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
        ) : (
          <div></div>
        )}
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
                      {data.dayReportCurrent?.powerCurrent?.originalTurbines.map(
                        (turbine) => (
                          <th
                            key={`header-${turbine.turbine}`}
                            className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700"
                          >
                            Total (MW)
                          </th>
                        ),
                      )}

                      <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 24 }, (_, hourIdx) => {
                      const remark =
                        data.dayReportCurrent?.powerCurrent?.remarks?.[
                          hourIdx
                        ] || "";

                      return (
                        <tr key={hourIdx}>
                          <td className="border px-2 py-1 text-center whitespace-nowrap">
                            {hours[hourIdx]}
                          </td>

                          {/* Hourly values per turbine */}
                          {data.dayReportCurrent?.powerCurrent?.originalTurbines.map(
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
                      {data.dayReportCurrent?.powerCurrent?.originalTurbines.map(
                        (turbine) => {
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
                        },
                      )}
                      <td className="border p-2 text-center"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {data.power?.fuelId === 1 ? (
            <>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold">* InFlow</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="inflowamount"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.inflowamount,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="text"
                        name="inflowaverage"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.inflowaverage,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold">* Turbine Dischard</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="tdAmount"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.tdAmount,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="text"
                        name="tdAverage"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.tdAverage,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold">* Spill Way</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="spillwayamount"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.spillwayamount,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="text"
                        name="spillwayaverage"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.spillwayaverage,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold">* Other Water Released</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="owramount"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.owramount,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="text"
                        name="owraverage"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.owraverage,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-7">
                <div>
                  <Label>Rain fall (mm)</Label>
                  <Input
                    type="text"
                    name="rainFall"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.rainFall,
                      ).toLocaleString() ?? ""
                    }
                    disabled
                  />
                </div>

                <div>
                  <Label>power Generation (kWh)</Label>
                  <Input
                    type="text"
                    name="powerGeneration"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.powerGeneration,
                      ).toLocaleString() ?? ""
                    }
                    disabled
                  />
                </div>

                <div>
                  <Label>Net Energy Import (kWh)</Label>
                  <Input
                    type="text"
                    name="netEnergyImport"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.netEnergyImport,
                      ).toLocaleString() ?? ""
                    }
                    disabled
                  />
                </div>

                <div>
                  <Label>Net Energy Output (kWh)</Label>
                  <Input
                    type="text"
                    name="netEnergyOutput"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.netEnergyOutput,
                      ).toLocaleString() ?? ""
                    }
                    disabled
                  />
                </div>

                <div>
                  <Label>Water Rate (m³/kWh)</Label>
                  <Input
                    type="text"
                    disabled
                    name="waterRate"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.waterRate,
                      ).toLocaleString() ?? 0
                    }
                  />
                </div>
                <div>
                  <Label>Total Outflow (m³)</Label>
                  <Input
                    type="text"
                    disabled
                    name="totalOutflow"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.totalOutflow,
                      ).toLocaleString() ?? 0
                    }
                  />
                </div>
                <div>
                  <Label>Average Outflow (m³/s)</Label>
                  <Input
                    type="text"
                    disabled
                    name="averageOutflow"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.averageOutflow,
                      ).toLocaleString() ?? 0
                    }
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold">* Active Storage</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="text"
                        name="activeStorageamount"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.activeStorageamount,
                          ).toLocaleString() ?? ""
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <Label>Percent ( % )</Label>
                      <Input
                        type="text"
                        disabled
                        name="activeStorageaverage"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={
                          Number(
                            data.dayReportCurrent?.activeStorageaverage,
                          ).toLocaleString() ?? 0
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-5 lg:grid-cols-5">
                <div>
                  <Label>Water Level at 00:00 (masl)</Label>
                  <Input
                    type="text"
                    name="waterLevel"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.waterLevel,
                      ).toLocaleString() ?? ""
                    }
                    disabled
                  />
                </div>

                <div>
                  <Label>Diff with Yesterday (m)</Label>
                  <Input
                    type="text"
                    disabled
                    name="dwy"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(data.dayReportCurrent?.dwy).toLocaleString() ?? 0
                    }
                  />
                </div>

                <div>
                  <Label>Diff with Full (m)</Label>
                  <Input
                    type="text"
                    disabled
                    name="dwf"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(data.dayReportCurrent?.dwf).toLocaleString() ?? 0
                    }
                  />
                </div>

                <div>
                  <Label>Diff with Min (m)</Label>
                  <Input
                    type="text"
                    disabled
                    name="dwm"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(data.dayReportCurrent?.dwm).toLocaleString() ?? 0
                    }
                  />
                </div>

                <div>
                  <Label>Potential Water Storage (m³)</Label>
                  <Input
                    type="text"
                    disabled
                    name="pws"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    // value={formatValue(formData.pws ?? 0)}
                    value={
                      Number(data.dayReportCurrent?.pws).toLocaleString() ?? 0
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-3">
                <div>
                  <Label>power Generation (kWh)</Label>
                  <Input
                    type="text"
                    name="powerGeneration"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.powerGeneration,
                      ).toLocaleString() ?? ""
                    }
                    disabled
                  />
                </div>

                <div>
                  <Label>Net Energy Import (kWh)</Label>
                  <Input
                    type="text"
                    name="netEnergyImport"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.netEnergyImport,
                      ).toLocaleString() ?? ""
                    }
                    disabled
                  />
                </div>

                <div>
                  <Label>Net Energy Output (kWh)</Label>
                  <Input
                    type="text"
                    name="netEnergyOutput"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={
                      Number(
                        data.dayReportCurrent?.netEnergyOutput,
                      ).toLocaleString() ?? ""
                    }
                    disabled
                  />
                </div>
              </div>
            </>
          )}

          <h1 className="pt-7 pb-6 text-center text-xl font-bold">
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
                  {/* <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Company
                  </th> */}
                  <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap dark:border-gray-700">
                    Total (MWh)
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
                {Array.isArray(data.dayReportHistorys) &&
                data.dayReportHistorys.length > 0 ? (
                  data.dayReportHistorys.map((revise, index) => (
                    <tr key={revise.id}>
                      <td className="border px-2 py-1 text-center">
                        {index + 1}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {revise.createdByUser?.firstname ?? "-"}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {revise.createdByUser?.lastname ?? "-"}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {revise.totalPower != null
                          ? new Intl.NumberFormat("lo-LA", {
                              maximumFractionDigits: 2,
                            }).format(revise.totalPower)
                          : ""}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {moment(revise.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {(user?.roleId === 3 ||
                          user?.roleId === 4 ||
                          user?.roleId === 5 ||
                          user?.roleId === 6) && (
                          <button
                            onClick={() =>
                              window.open(
                                `/${user?.roleId === 3 || user?.roleId === 4 ? "dispatch" : "declaration"}/createreport/reportrevise/${encryptId(revise.id)}`,
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
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-3 text-center text-gray-500 italic"
                    >
                      No revise history found
                    </td>
                  </tr>
                )}
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
