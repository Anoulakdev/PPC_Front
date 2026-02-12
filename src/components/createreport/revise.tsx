/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { decryptId } from "@/lib/cryptoId";
import Label from "../form/Label";
import Input from "../form/input/InputField";
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

export default function DayRevise() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [dataPower, setDataPower] = useState<any>(null);
  const [dataReport, setDataReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingInflow, setEditingInflow] = useState<
    "amount" | "average" | null
  >(null);
  const [editingTD, setEditingTD] = useState<"amount" | "average" | null>(null);
  const [editingSW, setEditingSW] = useState<"amount" | "average" | null>(null);
  const [editingOWR, setEditingOWR] = useState<"amount" | "average" | null>(
    null,
  );

  // ดึงข้อมูลจาก API
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
        const rawData = response.data;

        const current = rawData.dayReportCurrent;
        const powerCurrent = current?.powerCurrent;

        const turbines =
          powerCurrent?.originalTurbines?.map((t: any) => ({
            turbine: t.turbine,
            hourly: Array.isArray(t.hourly) ? [...t.hourly] : Array(24).fill(0),
          })) ?? [];

        const remarks = powerCurrent?.remarks ?? Array(24).fill("");

        setData({
          id: rawData.id,
          powerId: rawData.powerId,
          powerDate: rawData.powerDate,
          fuelId: rawData.power.fuelId,
          // water section
          activeStorageamount: current?.activeStorageamount ?? 0,
          activeStorageaverage: current?.activeStorageaverage ?? 0,
          waterLevel: current?.waterLevel ?? 0,
          dwy: current?.dwy ?? 0,
          dwf: current?.dwf ?? 0,
          dwm: current?.dwm ?? 0,
          pws: current?.pws ?? 0,
          inflowamount: current?.inflowamount ?? 0,
          inflowaverage: current?.inflowaverage ?? 0,
          tdAmount: current?.tdAmount ?? 0,
          tdAverage: current?.tdAverage ?? 0,
          spillwayamount: current?.spillwayamount ?? 0,
          spillwayaverage: current?.spillwayaverage ?? 0,
          owramount: current?.owramount ?? 0,
          owraverage: current?.owraverage ?? 0,
          rainFall: current?.rainFall ?? 0,
          powerGeneration: current?.powerGeneration ?? 0,
          netEnergyImport: current?.netEnergyImport ?? 0,
          netEnergyOutput: current?.netEnergyOutput ?? 0,
          waterRate: current?.waterRate ?? 0,
          totalOutflow: current?.totalOutflow ?? 0,
          averageOutflow: current?.averageOutflow ?? 0,

          // turbine data
          currentTurbines: turbines,
          remarks,
          totalPower: parseFloat(powerCurrent?.totalPower ?? 0),
          totalUnit: powerCurrent?.totalUnit ?? 0,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  useEffect(() => {
    if (data?.powerId != null) {
      axiosInstance
        .get(`/powers/${data?.powerId}`)
        .then((res) => setDataPower(res.data))
        .catch((err) => console.error("Fetch power error:", err));
    }
  }, [data?.powerId]);

  useEffect(() => {
    if (data?.powerId != null && data?.powerDate) {
      const powerDate1 = moment(data?.powerDate).format("YYYY-MM-DD");

      axiosInstance
        .get(
          `/dayreports/waterlevel?powerId=${data?.powerId}&powerDate=${powerDate1}`,
        )
        .then((res) => setDataReport(res.data))
        .catch((err) => console.error("Fetch power error:", err));
    }
  }, [data?.powerId, data?.powerDate]);

  // --- Event handlers ---
  const handleHourlyChange = (tIdx: number, hIdx: number, value: string) => {
    const updated = [...data.currentTurbines];
    let val = parseFloat(value);
    if (isNaN(val)) val = 0;

    // Update subsequent hours with same value
    for (let i = hIdx; i < 24; i++) {
      updated[tIdx].hourly[i] = parseFloat(val.toFixed(2));
    }
    setData({ ...data, currentTurbines: updated });
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    tIdx: number,
  ) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const values = text
      .split(/\t|\n|\r|\s+/)
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));

    const updated = [...data.currentTurbines];
    for (let i = 0; i < 24; i++) {
      updated[tIdx].hourly[i] = parseFloat((values[i] ?? 0).toFixed(2));
    }
    setData({ ...data, currentTurbines: updated });
  };

  const handleRemarkChange = (hourIdx: number, value: string) => {
    const updatedRemarks = [...(data?.remarks ?? [])];
    updatedRemarks[hourIdx] = value;
    setData({ ...data, remarks: updatedRemarks });
  };

  const handleHourlyValidate = (
    turbineIdx: number,
    hourIdx: number,
    value: string,
  ) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;

    const updated = [...data.currentTurbines];
    for (let i = hourIdx; i < 24; i++) {
      updated[turbineIdx].hourly[i] = parseFloat(num.toFixed(2));
    }
    setData({ ...data, currentTurbines: updated });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => (prev ? { ...prev, [name]: value } : null));
  };

  // --- Calculation helpers ---
  const getTurbineTotal = (turbine: any) =>
    turbine.hourly.reduce((sum: number, v: number) => sum + v, 0);

  const getGrandTotal = () =>
    data?.currentTurbines?.reduce(
      (grand: number, t: any) => grand + getTurbineTotal(t),
      0,
    ) ?? 0;

  useEffect(() => {
    const waterLevel = Number(data?.waterLevel ?? 0);
    const activeStorageamount = Number(data?.activeStorageamount ?? 0);
    const tdAmount = Number(data?.tdAmount ?? 0);

    const powerGeneration = Number(data?.powerGeneration ?? 0);
    const spillwayamount = Number(data?.spillwayamount ?? 0);
    const owramount = Number(data?.owramount ?? 0);

    const totalActiveFull = Number(dataPower?.totalActiveFull) || 0;
    const fullLevel = Number(dataPower?.fullLevel) || 0;
    const deadLevel = Number(dataPower?.deadLevel) || 0;
    const yesWaterLevel = Number(dataReport?.waterLevel) || 0;

    const activeStorageaverage =
      totalActiveFull !== 0 ? (activeStorageamount / totalActiveFull) * 100 : 0;
    const dwy =
      yesWaterLevel !== 0 ? waterLevel - yesWaterLevel : waterLevel - 0;
    const dwf = fullLevel !== 0 ? waterLevel - fullLevel : 0;
    const dwm = deadLevel !== 0 ? waterLevel - deadLevel : 0;
    const pws =
      totalActiveFull !== 0 ? totalActiveFull - activeStorageamount : 0;
    const waterRate =
      tdAmount !== 0 && powerGeneration !== 0 ? tdAmount / powerGeneration : 0;
    const totalOutflow = tdAmount + spillwayamount + owramount;
    const averageOutflow = totalOutflow !== 0 ? totalOutflow / (24 * 3600) : 0;

    setData((prev: any) => ({
      ...prev,
      activeStorageaverage: Number(activeStorageaverage.toFixed(2)),
      dwy: waterLevel ? Number(dwy.toFixed(2)) : 0,
      dwf: waterLevel ? Number(dwf.toFixed(2)) : 0,
      dwm: waterLevel ? Number(dwm.toFixed(2)) : 0,
      pws: activeStorageamount ? Number(pws.toFixed(2)) : 0,
      waterRate: tdAmount && powerGeneration ? Number(waterRate.toFixed(2)) : 0,
      totalOutflow:
        tdAmount || spillwayamount || owramount
          ? Number(totalOutflow.toFixed(2))
          : 0,
      averageOutflow: totalOutflow ? Number(averageOutflow.toFixed(2)) : 0,
    }));
  }, [
    data?.activeStorageamount,
    data?.waterLevel,
    data?.tdAmount,
    data?.spillwayamount,
    data?.owramount,
    data?.powerGeneration,
    dataPower?.totalActiveFull,
    dataPower?.fullLevel,
    dataPower?.deadLevel,
    dataReport?.waterLevel,
  ]);

  // ------------------------------------------

  useEffect(() => {
    if (editingInflow === "amount" && data?.inflowamount != null) {
      const inflowaverage = Number(data?.inflowamount) / (24 * 3600);
      setData((prev: any) => ({
        ...prev,
        inflowaverage: Number(inflowaverage.toFixed(2)),
      }));
    } else if (editingInflow === "average" && data?.inflowaverage != null) {
      const inflowamount = Number(data?.inflowaverage) * 24 * 3600;
      setData((prev: any) => ({
        ...prev,
        inflowamount: Number(inflowamount.toFixed(2)),
      }));
    }
  }, [data?.inflowamount, data?.inflowaverage, editingInflow]);

  useEffect(() => {
    if ((data?.inflowamount ?? 0) === 0 && (data?.inflowaverage ?? 0) === 0) {
      setEditingInflow(null);
    }
  }, [data?.inflowamount, data?.inflowaverage]);

  // ------------------------------------------

  useEffect(() => {
    if (editingTD === "amount" && data?.tdAmount != null) {
      const tdAverage = Number(data?.tdAmount) / (24 * 3600);
      setData((prev: any) => ({
        ...prev,
        tdAverage: Number(tdAverage.toFixed(2)),
      }));
    } else if (editingTD === "average" && data?.tdAverage != null) {
      const tdAmount = Number(data?.tdAverage) * 24 * 3600;
      setData((prev: any) => ({
        ...prev,
        tdAmount: Number(tdAmount.toFixed(2)),
      }));
    }
  }, [data?.tdAmount, data?.tdAverage, editingTD]);

  useEffect(() => {
    if ((data?.tdAmount ?? 0) === 0 && (data?.tdAverage ?? 0) === 0) {
      setEditingTD(null);
    }
  }, [data?.tdAmount, data?.tdAverage]);

  // ------------------------------------------------------------

  useEffect(() => {
    if (editingSW === "amount" && data?.spillwayamount != null) {
      const spillwayaverage = Number(data?.spillwayamount) / (24 * 3600);
      setData((prev: any) => ({
        ...prev,
        spillwayaverage: Number(spillwayaverage.toFixed(2)),
      }));
    } else if (editingSW === "average" && data?.spillwayaverage != null) {
      const spillwayamount = Number(data?.spillwayaverage) * 24 * 3600;
      setData((prev: any) => ({
        ...prev,
        spillwayamount: Number(spillwayamount.toFixed(2)),
      }));
    }
  }, [data?.spillwayamount, data?.spillwayaverage, editingSW]);

  useEffect(() => {
    if (
      (data?.spillwayamount ?? 0) === 0 &&
      (data?.spillwayaverage ?? 0) === 0
    ) {
      setEditingSW(null);
    }
  }, [data?.spillwayamount, data?.spillwayaverage]);

  // ------------------------------------------

  useEffect(() => {
    if (editingOWR === "amount" && data?.owramount != null) {
      const owraverage = Number(data?.owramount) / (24 * 3600);
      setData((prev: any) => ({
        ...prev,
        owraverage: Number(owraverage.toFixed(2)),
      }));
    } else if (editingOWR === "average" && data?.owraverage != null) {
      const owramount = Number(data?.owraverage) * 24 * 3600;
      setData((prev: any) => ({
        ...prev,
        owramount: Number(owramount.toFixed(2)),
      }));
    }
  }, [data?.owramount, data?.owraverage, editingOWR]);

  useEffect(() => {
    if ((data?.owramount ?? 0) === 0 && (data?.owraverage ?? 0) === 0) {
      setEditingOWR(null);
    }
  }, [data?.owramount, data?.owraverage]);

  // ------------------------------------------

  const nextDay = moment(data?.powerDate, "YYYY-MM-DD")
    .add(1, "day")
    .format("DD-MM-YYYY");

  // --- Submit revise ---
  const handleRevise = async () => {
    try {
      setLoading(true);
      const payload = {
        turbinedata: data.currentTurbines,
        totalPower: getGrandTotal().toFixed(2),
        totalUnit: data.totalUnit,
        remarks: data.remarks ?? [],
        // optional: include water-related fields if your API accepts
        activeStorageamount: data.activeStorageamount,
        activeStorageaverage: data.activeStorageaverage,
        waterLevel: data.waterLevel,
        dwy: data.dwy,
        dwf: data.dwf,
        dwm: data.dwm,
        pws: data.pws,
        inflowamount: data.inflowamount,
        inflowaverage: data.inflowaverage,
        tdAmount: data.tdAmount,
        tdAverage: data.tdAverage,
        outflowamount: data.outflowamount,
        outflowaverage: data.outflowaverage,
        spillwayamount: data.spillwayamount,
        spillwayaverage: data.spillwayaverage,
        owramount: data.owramount,
        owraverage: data.owraverage,
        rainFall: data.rainFall,
        powerGeneration: data.powerGeneration,
        netEnergyImport: data.netEnergyImport,
        netEnergyOutput: data.netEnergyOutput,
        waterRate: data.waterRate,
        totalOutflow: data.totalOutflow,
        averageOutflow: data.averageOutflow,
      };

      await axiosInstance.put(`/dayreports/revise/${data.id}`, payload);
      toast.success("Revise successfully");
      router.push("/declaration/createreport");
    } catch (error) {
      console.error("Revise error:", error);
      toast.error("Revise failed");
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
      <h1 className="mb-5 text-center text-xl font-bold">
        Daily Operation (Revise)
      </h1>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="my-3 text-3xl font-bold">
            # <span className="underline">Data Yesterday</span>{" "}
            <span className="text-red-700">
              (
              {data?.powerDate
                ? moment(data.powerDate).format("DD-MM-YYYY")
                : ""}
              )
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="table-auto text-left">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border p-2 text-center whitespace-nowrap">
                    Time Of Day (Hrs)
                  </th>
                  {data?.currentTurbines.map((t: any, tIdx: number) => (
                    <th
                      key={t.turbine}
                      className="w-[130px] border p-2 text-center whitespace-nowrap md:w-[250px]"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm">Total (MWh)</span>
                        <textarea
                          onPaste={(e) => handlePaste(e, tIdx)}
                          placeholder="Paste 24 values"
                          className="mt-1 w-full rounded border p-1 text-xs"
                        />
                      </div>
                    </th>
                  ))}
                  <th className="w-[180px] border p-2 text-center whitespace-nowrap md:w-[300px]">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {hours.map((time, hIdx) => (
                  <tr key={time}>
                    <td className="border p-2 text-center whitespace-nowrap">
                      {time}
                    </td>
                    {data?.currentTurbines.map((t: any, tIdx: number) => (
                      <td
                        key={`hourly-${t.turbine}-${hIdx}`}
                        className="border p-1 whitespace-nowrap"
                      >
                        <input
                          type="number"
                          value={t.hourly[hIdx] === 0 ? "" : t.hourly[hIdx]}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d{0,2}$/.test(val)) {
                              handleHourlyChange(tIdx, hIdx, val);
                            }
                          }}
                          onBlur={(e) => {
                            let val = parseFloat(e.target.value) || 0;
                            val = parseFloat(val.toFixed(2));
                            handleHourlyValidate(tIdx, hIdx, val.toString());
                          }}
                          className="w-full rounded border px-1 py-1 placeholder:text-gray-900 dark:placeholder:text-gray-100"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className="border p-1 whitespace-nowrap">
                      <input
                        type="text"
                        value={data?.remarks[hIdx] || ""}
                        onChange={(e) =>
                          handleRemarkChange(hIdx, e.target.value)
                        }
                        className="w-[180px] rounded border px-1 py-1 md:w-[300px]"
                        placeholder="Remarks"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold dark:bg-gray-800">
                  <td className="border p-2 text-center">Total (MWh)</td>
                  {data?.currentTurbines.map((t: any) => (
                    <td
                      key={`total-${t.turbine}`}
                      className="border p-2 text-center"
                    >
                      {getTurbineTotal(t).toFixed(2)} MWh
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    {/* Grand: {getGrandTotal().toFixed(2)} MWh */}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {data?.fuelId === 1 ? (
            <>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold">* InFlow</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="number"
                        name="inflowamount"
                        placeholder="0.00"
                        value={data?.inflowamount ?? ""}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);

                          if (e.target.value === "") {
                            // ถ้าผู้ใช้ลบจนว่าง → เคลียร์ทั้งคู่และให้ป้อนได้ทั้งสองช่อง
                            setData((prev: any) => ({
                              ...prev,
                              inflowamount: "",
                              inflowaverage: "",
                            }));
                            setEditingInflow(null);
                          } else {
                            setData((prev: any) => ({
                              ...prev,
                              inflowamount: isNaN(raw)
                                ? ""
                                : Number(raw.toFixed(2)),
                            }));
                            setEditingInflow("amount");
                          }
                        }}
                        readOnly={editingInflow === "average"}
                        required
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="number"
                        name="inflowaverage"
                        placeholder="0.00"
                        value={data?.inflowaverage ?? ""}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);

                          if (e.target.value === "") {
                            // ถ้าผู้ใช้ลบจนว่าง → เคลียร์ทั้งคู่และให้ป้อนได้ทั้งสองช่อง
                            setData((prev: any) => ({
                              ...prev,
                              inflowamount: "",
                              inflowaverage: "",
                            }));
                            setEditingInflow(null);
                          } else {
                            setData((prev: any) => ({
                              ...prev,
                              inflowaverage: isNaN(raw)
                                ? ""
                                : Number(raw.toFixed(2)),
                            }));
                            setEditingInflow("average");
                          }
                        }}
                        readOnly={editingInflow === "amount"}
                        required
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
                        type="number"
                        name="tdAmount"
                        placeholder="0.00"
                        value={data?.tdAmount ?? ""}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);

                          if (e.target.value === "") {
                            // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                            setData((prev: any) => ({
                              ...prev,
                              tdAmount: "",
                              tdAverage: "",
                            }));
                            setEditingTD(null);
                          } else {
                            setData((prev: any) => ({
                              ...prev,
                              tdAmount: isNaN(raw)
                                ? ""
                                : Number(raw.toFixed(2)),
                            }));
                            setEditingTD("amount");
                          }
                        }}
                        readOnly={editingTD === "average"}
                        required
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="number"
                        name="tdAverage"
                        placeholder="0.00"
                        value={data?.tdAverage ?? ""}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);

                          if (e.target.value === "") {
                            // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                            setData((prev: any) => ({
                              ...prev,
                              tdAmount: "",
                              tdAverage: "",
                            }));
                            setEditingTD(null);
                          } else {
                            setData((prev: any) => ({
                              ...prev,
                              tdAverage: isNaN(raw)
                                ? ""
                                : Number(raw.toFixed(2)),
                            }));
                            setEditingTD("average");
                          }
                        }}
                        readOnly={editingTD === "amount"}
                        required
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
                        type="number"
                        name="spillwayamount"
                        placeholder="0.00"
                        value={data?.spillwayamount ?? ""}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);

                          if (e.target.value === "") {
                            // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                            setData((prev: any) => ({
                              ...prev,
                              spillwayamount: "",
                              spillwayaverage: "",
                            }));
                            setEditingSW(null);
                          } else {
                            setData((prev: any) => ({
                              ...prev,
                              spillwayamount: isNaN(raw)
                                ? ""
                                : Number(raw.toFixed(2)),
                            }));
                            setEditingSW("amount");
                          }
                        }}
                        readOnly={editingSW === "average"}
                        required
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="number"
                        name="spillwayaverage"
                        placeholder="0.00"
                        value={data?.spillwayaverage ?? ""}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);

                          if (e.target.value === "") {
                            // ถ้าลบจนว่าง → เคลียร์ทั้งคู่

                            setData((prev: any) => ({
                              ...prev,
                              spillwayamount: "",
                              spillwayaverage: "",
                            }));
                            setEditingSW(null);
                          } else {
                            setData((prev: any) => ({
                              ...prev,
                              spillwayaverage: isNaN(raw)
                                ? ""
                                : Number(raw.toFixed(2)),
                            }));
                            setEditingSW("average");
                          }
                        }}
                        readOnly={editingSW === "amount"}
                        required
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
                        type="number"
                        name="owramount"
                        placeholder="0.00"
                        value={data?.owramount ?? ""}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);

                          if (e.target.value === "") {
                            // ถ้าลบจนว่าง → เคลียร์ทั้งคู่

                            setData((prev: any) => ({
                              ...prev,
                              owramount: "",
                              owraverage: "",
                            }));
                            setEditingOWR(null);
                          } else {
                            setData((prev: any) => ({
                              ...prev,
                              owramount: isNaN(raw)
                                ? ""
                                : Number(raw.toFixed(2)),
                            }));
                            setEditingOWR("amount");
                          }
                        }}
                        readOnly={editingOWR === "average"}
                        required
                      />
                    </div>

                    <div>
                      <Label>Average (m³/s)</Label>
                      <Input
                        type="number"
                        name="owraverage"
                        placeholder="0.00"
                        value={data?.owraverage ?? ""}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);

                          if (e.target.value === "") {
                            // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                            setData((prev: any) => ({
                              ...prev,
                              owramount: "",
                              owraverage: "",
                            }));
                            setEditingOWR(null);
                          } else {
                            setData((prev: any) => ({
                              ...prev,
                              owraverage: isNaN(raw)
                                ? ""
                                : Number(raw.toFixed(2)),
                            }));
                            setEditingOWR("average");
                          }
                        }}
                        readOnly={editingOWR === "amount"}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-7">
                <div>
                  <Label>Rain fall (mm)</Label>
                  <Input
                    type="number"
                    name="rainFall"
                    placeholder="0.00"
                    value={data?.rainFall ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>power Generation (kWh)</Label>
                  <Input
                    type="number"
                    name="powerGeneration"
                    placeholder="0.00"
                    value={data?.powerGeneration ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Net Energy Import (kWh)</Label>
                  <Input
                    type="number"
                    name="netEnergyImport"
                    placeholder="0.00"
                    value={data?.netEnergyImport ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Net Energy Output (kWh)</Label>
                  <Input
                    type="number"
                    name="netEnergyOutput"
                    placeholder="0.00"
                    value={data?.netEnergyOutput ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Water Rate (m³/kWh)</Label>
                  <Input
                    type="number"
                    disabled
                    name="waterRate"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={data?.waterRate ?? 0}
                  />
                </div>
                <div>
                  <Label>Total Outflow (m³)</Label>
                  <Input
                    type="number"
                    disabled
                    name="totalOutflow"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={data?.totalOutflow ?? 0}
                  />
                </div>
                <div>
                  <Label>Average Outflow (m³/s)</Label>
                  <Input
                    type="number"
                    disabled
                    name="averageOutflow"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={data?.averageOutflow ?? 0}
                  />
                </div>
              </div>

              <div className="my-3 text-3xl font-bold">
                # <span className="underline">Data Today</span>{" "}
                <span className="text-red-700"> ({nextDay})</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold">* Active Storage</h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Amount (m³)</Label>
                      <Input
                        type="number"
                        name="activeStorageamount"
                        placeholder="0.00"
                        value={data?.activeStorageamount || ""}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <Label>Percent (%)</Label>
                      <Input
                        type="number"
                        disabled
                        name="activeStorageaverage"
                        className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                        value={data?.activeStorageaverage ?? 0}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-5 lg:grid-cols-5">
                <div>
                  <Label>Water Level at 00:00 (masl)</Label>
                  <Input
                    type="number"
                    name="waterLevel"
                    placeholder="0.00"
                    value={data?.waterLevel ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Diff with Yesterday (m)</Label>
                  <Input
                    type="number"
                    disabled
                    name="dwy"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={data?.dwy ?? 0}
                  />
                </div>

                <div>
                  <Label>Diff with Full (m)</Label>
                  <Input
                    type="number"
                    disabled
                    name="dwf"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={data?.dwf ?? 0}
                  />
                </div>

                <div>
                  <Label>Diff with Min (m)</Label>
                  <Input
                    type="number"
                    disabled
                    name="dwm"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={data?.dwm ?? 0}
                  />
                </div>

                <div>
                  <Label>Potential Water Storage (m³)</Label>
                  <Input
                    type="number"
                    disabled
                    name="pws"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={data?.pws ?? 0}
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
                    type="number"
                    name="powerGeneration"
                    placeholder="0.00"
                    value={data?.powerGeneration ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Net Energy Import (kWh)</Label>
                  <Input
                    type="number"
                    name="netEnergyImport"
                    placeholder="0.00"
                    value={data?.netEnergyImport ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Net Energy Output (kWh)</Label>
                  <Input
                    type="number"
                    name="netEnergyOutput"
                    placeholder="0.00"
                    value={data?.netEnergyOutput ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleRevise}
            disabled={loading}
            className="mt-6 w-full rounded-md bg-blue-500 px-4 py-2 text-lg text-white hover:bg-blue-600"
          >
            {loading ? "Revising..." : "Revise"}
          </button>
        </>
      )}
    </div>
  );
}
