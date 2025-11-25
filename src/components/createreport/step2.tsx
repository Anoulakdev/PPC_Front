/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useCreateReportStore } from "@/store/createReportStore";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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

type Power = {
  id: number;
  name: string;
  unit: number;
  abbreviation: string;
  address: string;
  phone: string;
  companyId: number;
  powerimg: string;
  voltageId: number;
  fuelId: number;
  contractId: number;
  branchId: number;
  regionId: number;
  ownerId: number;
  latitude: number;
  longitude: number;
  installCapacity: string;
  baseEnergy: string;
  fullLevel: string;
  deadLevel: string;
  totalStorageFull: string;
  totalStorageDead: string;
  totalActiveFull: string;
  totalActiveDead: string;
  codDate: string;
};

type DataReport = {
  waterLevel: string;
};

export const Step2 = () => {
  const [data, setData] = useState<Power | null>(null);
  const [dataReport, setDataReport] = useState<DataReport | null>(null);
  const { formData, updateFormData, prevStep, resetForm } =
    useCreateReportStore();
  const unit = formData.totalUnit || 1;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingInflow, setEditingInflow] = useState<
    "amount" | "average" | null
  >(null);
  const [editingTD, setEditingTD] = useState<"amount" | "average" | null>(null);
  const [editingSW, setEditingSW] = useState<"amount" | "average" | null>(null);
  const [editingOWR, setEditingOWR] = useState<"amount" | "average" | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (formData.powerId != null) {
      axiosInstance
        .get(`/powers/${formData.powerId}`)
        .then((res) => setData(res.data))
        .catch((err) => console.error("Fetch power error:", err));
    }
  }, [formData.powerId]);

  useEffect(() => {
    if (formData.powerId != null && formData.powerDate) {
      const powerDate1 = moment(formData.powerDate, "DD-MM-YYYY").format(
        "YYYY-MM-DD",
      );

      axiosInstance
        .get(
          `/dayreports/waterlevel?powerId=${formData.powerId}&powerDate=${powerDate1}`,
        )
        .then((res) => setDataReport(res.data))
        .catch((err) => console.error("Fetch power error:", err));
    }
  }, [formData.powerId, formData.powerDate]);

  useEffect(() => {
    const turbineData = Array.from({ length: unit }, (_, tIdx) => ({
      turbine: tIdx + 1,
      hourly: Array(24).fill(0),
    }));
    const remarks = Array(24).fill("");
    updateFormData({ turbineData, remarks });
  }, [unit, updateFormData]);

  const handleHourlyChange = (
    turbineIdx: number,
    hourIdx: number,
    value: string,
  ) => {
    const updated = [...formData.turbineData];
    const floatValue = parseFloat(value) || 0;

    // แทนค่าทั้งหมดจาก hourIdx ถึง 23 ด้วยค่าที่กรอก
    for (let i = hourIdx; i < 24; i++) {
      updated[turbineIdx].hourly[i] = floatValue;
    }

    updateFormData({ turbineData: updated });
  };

  const handleRemarkChange = (hourIdx: number, value: string) => {
    const updated = [...(formData.remarks || Array(24).fill(""))];
    updated[hourIdx] = value;
    updateFormData({ remarks: updated });
  };

  const handleHourlyValidate = (
    turbineIdx: number,
    hourIdx: number,
    value: string,
  ) => {
    const num = parseFloat(value) || 0;
    const fixed = parseFloat(num.toFixed(2));
    const updated = [...formData.turbineData];

    for (let i = hourIdx; i < 24; i++) {
      updated[turbineIdx].hourly[i] = fixed;
    }

    updateFormData({ turbineData: updated });
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    turbineIdx: number,
  ) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const values = text
      .split(/\t|\n|\r|\s+/)
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));

    const updated = [...formData.turbineData];
    for (let i = 0; i < 24; i++) {
      updated[turbineIdx].hourly[i] = values[i] ?? 0;
    }
    updateFormData({ turbineData: updated });
  };

  const getTotal = (turbineIdx: number) =>
    (formData.turbineData[turbineIdx]?.hourly || []).reduce((a, b) => a + b, 0);

  const grandTotal = (formData.turbineData || []).reduce(
    (grand, t) => grand + (t.hourly || []).reduce((a, b) => a + b, 0),
    0,
  );

  useEffect(() => {
    const fixedTotal = parseFloat(grandTotal.toFixed(2));
    updateFormData({ totalPower: fixedTotal });
  }, [grandTotal, updateFormData]);

  // const formatValue = (v: number | undefined) =>
  //   typeof v === "number" ? v.toFixed(2) : "0.00";

  // --------------------------------------------------------------

  useEffect(() => {
    const waterLevel = Number(formData?.waterLevel ?? 0);
    const activeStorageamount = Number(formData?.activeStorageamount ?? 0);
    const tdAmount = Number(formData?.tdAmount ?? 0);

    const powerGeneration = Number(formData?.powerGeneration ?? 0);
    const spillwayamount = Number(formData?.spillwayamount ?? 0);
    const owramount = Number(formData?.owramount ?? 0);

    const totalActiveFull = Number(data?.totalActiveFull) || 0;
    const fullLevel = Number(data?.fullLevel) || 0;
    const deadLevel = Number(data?.deadLevel) || 0;
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

    updateFormData({
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
    });
  }, [
    formData?.activeStorageamount,
    formData?.waterLevel,
    formData?.tdAmount,
    formData?.spillwayamount,
    formData?.owramount,
    formData?.powerGeneration,
    data?.totalActiveFull,
    data?.fullLevel,
    data?.deadLevel,
    dataReport?.waterLevel,
  ]);

  useEffect(() => {
    if (editingInflow === "amount" && formData.inflowamount != null) {
      const inflowaverage = Number(formData.inflowamount) / (24 * 3600);
      updateFormData({
        inflowaverage: Number(inflowaverage.toFixed(2)),
      });
    } else if (editingInflow === "average" && formData.inflowaverage != null) {
      const inflowamount = Number(formData.inflowaverage) * 24 * 3600;
      updateFormData({
        inflowamount: Number(inflowamount.toFixed(2)),
      });
    }
  }, [formData.inflowamount, formData.inflowaverage, editingInflow]);

  useEffect(() => {
    if (
      (formData.inflowamount ?? 0) === 0 &&
      (formData.inflowaverage ?? 0) === 0
    ) {
      setEditingInflow(null);
    }
  }, [formData.inflowamount, formData.inflowaverage]);

  // ------------------------------------------

  useEffect(() => {
    if (editingTD === "amount" && formData.tdAmount != null) {
      const tdAverage = Number(formData.tdAmount) / (24 * 3600);
      updateFormData({
        tdAverage: Number(tdAverage.toFixed(2)),
      });
    } else if (editingTD === "average" && formData.tdAverage != null) {
      const tdAmount = Number(formData.tdAverage) * 24 * 3600;
      updateFormData({
        tdAmount: Number(tdAmount.toFixed(2)),
      });
    }
  }, [formData.tdAmount, formData.tdAverage, editingTD]);

  useEffect(() => {
    if ((formData.tdAmount ?? 0) === 0 && (formData.tdAverage ?? 0) === 0) {
      setEditingTD(null);
    }
  }, [formData.tdAmount, formData.tdAverage]);

  // ------------------------------------------------------------

  useEffect(() => {
    if (editingSW === "amount" && formData.spillwayamount != null) {
      const spillwayaverage = Number(formData.spillwayamount) / (24 * 3600);
      updateFormData({
        spillwayaverage: Number(spillwayaverage.toFixed(2)),
      });
    } else if (editingSW === "average" && formData.spillwayaverage != null) {
      const spillwayamount = Number(formData.spillwayaverage) * 24 * 3600;
      updateFormData({
        spillwayamount: Number(spillwayamount.toFixed(2)),
      });
    }
  }, [formData.spillwayamount, formData.spillwayaverage, editingSW]);

  useEffect(() => {
    if (
      (formData.spillwayamount ?? 0) === 0 &&
      (formData.spillwayaverage ?? 0) === 0
    ) {
      setEditingSW(null);
    }
  }, [formData.spillwayamount, formData.spillwayaverage]);

  // ------------------------------------------

  useEffect(() => {
    if (editingOWR === "amount" && formData.owramount != null) {
      const owraverage = Number(formData.owramount) / (24 * 3600);
      updateFormData({
        owraverage: Number(owraverage.toFixed(2)),
      });
    } else if (editingOWR === "average" && formData.owraverage != null) {
      const owramount = Number(formData.owraverage) * 24 * 3600;
      updateFormData({
        owramount: Number(owramount.toFixed(2)),
      });
    }
  }, [formData.owramount, formData.owraverage, editingOWR]);

  useEffect(() => {
    if ((formData.owramount ?? 0) === 0 && (formData.owraverage ?? 0) === 0) {
      setEditingOWR(null);
    }
  }, [formData.owramount, formData.owraverage]);

  // ------------------------------------------

  // const toFixed2 = (val: string | number | undefined | null): string => {
  //   const num = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  //   if (isNaN(num)) return "0.00";
  //   return num.toFixed(2); // return string เช่น "68.00"
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        powerId: formData.powerId ?? null,
        powerDate: moment(formData.powerDate, "DD-MM-YYYY").format(
          "YYYY-MM-DD",
        ),
        activeStorageamount: formData.activeStorageamount,
        activeStorageaverage: formData.activeStorageaverage,
        waterLevel: formData.waterLevel,
        dwy: formData.dwy,
        dwf: formData.dwf,
        dwm: formData.dwm,
        pws: formData.pws,
        inflowamount: formData.inflowamount,
        inflowaverage: formData.inflowaverage,
        tdAmount: formData.tdAmount,
        tdAverage: formData.tdAverage,
        spillwayamount: formData.spillwayamount,
        spillwayaverage: formData.spillwayaverage,
        owramount: formData.owramount,
        owraverage: formData.owraverage,
        rainFall: formData.rainFall,
        powerGeneration: formData.powerGeneration,
        netEnergyImport: formData.netEnergyImport,
        netEnergyOutput: formData.netEnergyOutput,
        waterRate: formData.waterRate,
        totalOutflow: formData.totalOutflow,
        averageOutflow: formData.averageOutflow,
        totalPower: parseFloat((formData.totalPower ?? 0).toFixed(2)),
        totalUnit: formData.totalUnit ?? 0,
        remarks: formData.remarks || Array(24).fill(""),
        turbinedata: formData.turbineData || [],
      };

      await axiosInstance.post("/dayreports", payload);
      resetForm();
      toast.success("Added successfully!");
      router.push("/declaration/createreport");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Submit failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="text-3xl font-bold">
        # <span className="underline">Data Yesterday</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto text-left">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border p-2 text-center whitespace-nowrap">
                Time Of Day (Hrs)
              </th>
              {(formData.turbineData || []).map((t, tIdx) => (
                <th
                  key={t.turbine}
                  className="w-[130px] border p-2 text-center whitespace-nowrap md:w-[250px]"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm">Total (MW)</span>
                    <textarea
                      onPaste={(e) => handlePaste(e, tIdx)}
                      placeholder="Paste 24 values"
                      className="mt-1 w-full rounded border p-1 text-xs"
                    />
                  </div>
                </th>
              ))}
              <th className="w-[180px] border p-2 text-center whitespace-nowrap md:w-[300px]">
                remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {hours.map((time, hIdx) => {
              return (
                <tr key={time}>
                  <td className="border p-2 text-center whitespace-nowrap">
                    {time}
                  </td>
                  {(formData.turbineData || []).map((t, tIdx) => {
                    return (
                      <td
                        key={`hourly-${t.turbine}-${hIdx}`}
                        className="border p-1 whitespace-nowrap"
                      >
                        <input
                          type="number"
                          value={t.hourly[hIdx]} // แสดง 2 ตำแหน่งทศนิยม
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d{0,2}$/.test(val)) {
                              handleHourlyChange(tIdx, hIdx, val);
                            }
                          }}
                          onBlur={(e) => {
                            // ปรับเลขให้มี 2 ตำแหน่งตอนออกจาก input
                            let val = parseFloat(e.target.value) || 0;
                            val = parseFloat(val.toFixed(2)); // ตัดทศนิยม 2 ตำแหน่งจริง ๆ
                            handleHourlyValidate(tIdx, hIdx, val.toString());
                          }}
                          className="w-full rounded border px-1 py-1"
                          placeholder="MW"
                        />
                      </td>
                    );
                  })}

                  <td className="border p-1 whitespace-nowrap">
                    <input
                      type="text"
                      value={formData.remarks?.[hIdx] || ""}
                      onChange={(e) => handleRemarkChange(hIdx, e.target.value)}
                      className="w-[180px] rounded border px-1 py-1 md:w-[300px]"
                      placeholder="Remarks"
                    />
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-50 font-bold dark:bg-gray-800">
              <td className="border p-2 text-center">Total (MWh)</td>
              {(formData.turbineData || []).map((t, tIdx) => (
                <td
                  key={`total-${t.turbine}`}
                  className="border p-2 text-center"
                >
                  {getTotal(tIdx).toFixed(2)} MWh
                </td>
              ))}
              <td className="border p-2 text-center">
                {/* {grandTotal.toFixed(2)} MWh */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold">* InFlow</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (m³)</Label>
              <Input
                type="number"
                name="inflowamount"
                placeholder="0.00"
                value={formData.inflowamount ?? ""}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  if (e.target.value === "") {
                    // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                    updateFormData({
                      inflowamount: "",
                      inflowaverage: "",
                    });
                    setEditingInflow(null);
                  } else {
                    updateFormData({
                      inflowamount: isNaN(raw) ? "" : raw,
                    });
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
                value={formData.inflowaverage ?? ""}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  if (e.target.value === "") {
                    // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                    updateFormData({
                      inflowamount: "",
                      inflowaverage: "",
                    });
                    setEditingInflow(null);
                  } else {
                    updateFormData({
                      inflowaverage: isNaN(raw) ? "" : raw,
                    });
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
                value={formData.tdAmount ?? ""}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);

                  if (e.target.value === "") {
                    // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                    updateFormData({
                      tdAmount: "",
                      tdAverage: "",
                    });
                    setEditingTD(null);
                  } else {
                    updateFormData({
                      tdAmount: isNaN(raw) ? "" : raw,
                    });
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
                value={formData.tdAverage ?? ""}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);

                  if (e.target.value === "") {
                    // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                    updateFormData({
                      tdAmount: "",
                      tdAverage: "",
                    });
                    setEditingTD(null);
                  } else {
                    updateFormData({
                      tdAverage: isNaN(raw) ? "" : raw,
                    });
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

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold">* Spill Way</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (m³)</Label>
              <Input
                type="number"
                name="spillwayamount"
                placeholder="0.00"
                value={formData.spillwayamount ?? ""}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);

                  if (e.target.value === "") {
                    // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                    updateFormData({
                      spillwayamount: "",
                      spillwayaverage: "",
                    });
                    setEditingSW(null);
                  } else {
                    updateFormData({
                      spillwayamount: isNaN(raw) ? "" : raw,
                    });
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
                value={formData.spillwayaverage ?? ""}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);

                  if (e.target.value === "") {
                    // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                    updateFormData({
                      spillwayamount: "",
                      spillwayaverage: "",
                    });
                    setEditingSW(null);
                  } else {
                    updateFormData({
                      spillwayaverage: isNaN(raw) ? "" : raw,
                    });
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
                value={formData.owramount ?? ""}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);

                  if (e.target.value === "") {
                    // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                    updateFormData({
                      owramount: "",
                      owraverage: "",
                    });
                    setEditingOWR(null);
                  } else {
                    updateFormData({
                      owramount: isNaN(raw) ? "" : raw,
                    });
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
                value={formData.owraverage ?? ""}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);

                  if (e.target.value === "") {
                    // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                    updateFormData({
                      owramount: "",
                      owraverage: "",
                    });
                    setEditingOWR(null);
                  } else {
                    updateFormData({
                      owraverage: isNaN(raw) ? "" : raw,
                    });
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

      <div className="grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-7">
        <div>
          <Label>Rain fall (mm)</Label>
          <Input
            type="number"
            name="rainFall"
            placeholder="0.00"
            value={formData.rainFall ?? ""}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                rainFall: isNaN(raw) ? "" : raw, // อัปเดตระหว่างพิมพ์
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                rainFall: isNaN(raw) ? "" : raw,
              });
            }}
            required
          />
        </div>

        <div>
          <Label>Power Generation (kWh)</Label>
          <Input
            type="number"
            name="powerGeneration"
            placeholder="0.00"
            value={formData.powerGeneration ?? ""}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                powerGeneration: isNaN(raw) ? "" : raw, // อัปเดตระหว่างพิมพ์
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                powerGeneration: isNaN(raw) ? "" : raw,
              });
            }}
            required
          />
        </div>

        <div>
          <Label>Net Energy Import (kWh)</Label>
          <Input
            type="number"
            name="netEnergyImport"
            placeholder="0.00"
            value={formData.netEnergyImport ?? ""}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                netEnergyImport: isNaN(raw) ? "" : raw, // อัปเดตระหว่างพิมพ์
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                netEnergyImport: isNaN(raw) ? "" : raw,
              });
            }}
            required
          />
        </div>

        <div>
          <Label>Net Energy Output (kWh)</Label>
          <Input
            type="number"
            name="netEnergyOutput"
            placeholder="0.00"
            value={formData.netEnergyOutput ?? ""}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                netEnergyOutput: isNaN(raw) ? "" : raw, // อัปเดตระหว่างพิมพ์
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                netEnergyOutput: isNaN(raw) ? "" : raw,
              });
            }}
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
            value={formData.waterRate ?? 0}
          />
        </div>
        <div>
          <Label>Total Outflow (m³)</Label>
          <Input
            type="number"
            disabled
            name="totalOutflow"
            className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
            value={formData.totalOutflow ?? 0}
          />
        </div>
        <div>
          <Label>Average Outflow (m³/s)</Label>
          <Input
            type="number"
            disabled
            name="averageOutflow"
            className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
            value={formData.averageOutflow ?? 0}
          />
        </div>
      </div>

      <div className="text-3xl font-bold">
        # <span className="underline">Data Today</span>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold">* Active Storage</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (m³)</Label>
              <Input
                type="number"
                name="activeStorageamount"
                placeholder="0.00"
                value={formData.activeStorageamount ?? ""}
                onChange={(e) => {
                  updateFormData({
                    activeStorageamount: e.target.value,
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    activeStorageamount: isNaN(raw) ? "" : raw,
                  });
                }}
                required
              />
            </div>

            <div>
              <Label>Percent ( % )</Label>
              <Input
                type="number"
                disabled
                name="activeStorageaverage"
                className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                value={formData.activeStorageaverage ?? 0}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 lg:grid-cols-5">
        <div>
          <Label>Water Level at 00:00 (masl)</Label>
          <Input
            type="number"
            name="waterLevel"
            placeholder="0.00"
            value={formData.waterLevel ?? ""}
            onChange={(e) => {
              updateFormData({
                waterLevel: e.target.value,
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                waterLevel: isNaN(raw) ? "" : raw,
              });
            }}
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
            value={formData.dwy ?? 0}
          />
        </div>

        <div>
          <Label>Diff with Full (m)</Label>
          <Input
            type="number"
            disabled
            name="dwf"
            className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
            value={formData.dwf ?? 0}
          />
        </div>

        <div>
          <Label>Diff with Min (m)</Label>
          <Input
            type="number"
            disabled
            name="dwm"
            className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
            value={formData.dwm ?? 0}
          />
        </div>

        <div>
          <Label>Potential Water Storage (m³)</Label>
          <Input
            type="number"
            disabled
            name="pws"
            className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
            // value={formatValue(formData.pws ?? 0)}
            value={formData.pws ?? 0}
          />
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`rounded px-4 py-2 text-white ${
            isSubmitting
              ? "cursor-not-allowed bg-blue-300"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};
