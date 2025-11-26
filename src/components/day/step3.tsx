"use client";
import { useDayPowerStore } from "@/store/dayPowerStore";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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

export const Step3 = () => {
  const { formData, updateFormData, prevStep, resetForm } = useDayPowerStore();
  const unit = formData.unit || 1;
  const { machinesAvailability = [] } = formData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // ใช้ useCallback เพื่อป้องกัน infinite loop
  const initializeTurbineData = useCallback(() => {
    const turbineData = Array.from({ length: unit }, (_, tIdx) => ({
      turbine: tIdx + 1,
      hourly: Array(24).fill(0), // ใช้ 0 แทน "" เพื่อความสอดคล้อง
    }));
    const remarks = Array(24).fill("");
    updateFormData({ turbineData, remarks });
  }, [unit, updateFormData]);

  useEffect(() => {
    // เช็คว่ามีข้อมูลอยู่แล้วหรือไม่
    if (!formData.turbineData || formData.turbineData.length !== unit) {
      initializeTurbineData();
    }
  }, [unit, formData.turbineData, initializeTurbineData]);

  const handleHourlyChange = (
    turbineIdx: number,
    hourIdx: number,
    value: string,
  ) => {
    const updated = [...formData.turbineData];
    // เก็บค่าเป็น string ถ้ายังพิมพ์ไม่เสร็จ, เป็น number ถ้าพิมพ์เสร็จแล้ว
    const floatValue = value === "" ? 0 : parseFloat(value);

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
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;

    const turbine = formData.turbineData[turbineIdx].turbine;
    const machine = machinesAvailability.find((m) => m.turbine === turbine);

    // 👉 ถ้าเป็น 0 ไม่ต้อง validate
    if (num !== 0 && machine) {
      if (num < machine.mins) num = machine.mins;
      if (num > machine.maxs) num = machine.maxs;
    }

    const updated = [...formData.turbineData];
    for (let i = hourIdx; i < 24; i++) {
      updated[turbineIdx].hourly[i] = parseFloat(num.toFixed(2));
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
    const turbine = updated[turbineIdx].turbine;
    const machine = machinesAvailability.find((m) => m.turbine === turbine);

    for (let i = 0; i < 24; i++) {
      let val = values[i] ?? 0;
      // ตรวจสอบ min/max เฉพาะเมื่อค่าไม่เป็น 0
      if (val !== 0 && machine) {
        if (val < machine.mins) val = machine.mins;
        if (val > machine.maxs) val = machine.maxs;
      }
      updated[turbineIdx].hourly[i] = parseFloat(val.toFixed(2));
    }
    updateFormData({ turbineData: updated });
  };

  const getTotal = (turbineIdx: number) =>
    (formData.turbineData[turbineIdx]?.hourly || []).reduce(
      (a, b) => a + (typeof b === "number" ? b : 0),
      0,
    );

  const grandTotal = (formData.turbineData || []).reduce(
    (grand, t) =>
      grand +
      (t.hourly || []).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0),
    0,
  );

  // ใช้ useCallback เพื่อป้องกัน infinite loop
  const updateTotalPower = useCallback(() => {
    updateFormData({ totalPower: grandTotal });
  }, [grandTotal, updateFormData]);

  useEffect(() => {
    updateTotalPower();
  }, [updateTotalPower]);

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
        powerNo: formData.abbreviation ?? "",
        powerDate: moment(formData.powerDate, "DD-MM-YYYY").format(
          "YYYY-MM-DD",
        ),
        upstreamLevel: formData.upstreamLevel,
        downstreamLevel: formData.downstreamLevel,
        totalStorageamount: formData.totalStorageamount,
        totalStorageaverage: formData.totalStorageaverage,
        activeStorageamount: formData.activeStorageamount,
        activeStorageaverage: formData.activeStorageaverage,
        turbineDischargeamount: formData.turbineDischargeamount,
        turbineDischargeaverage: formData.turbineDischargeaverage,
        spillwayDischargeamount: formData.spillwayDischargeamount,
        spillwayDischargeaverage: formData.spillwayDischargeaverage,
        ecologicalDischargeamount: formData.ecologicalDischargeamount,
        ecologicalDischargeaverage: formData.ecologicalDischargeaverage,
        totalDischargeamount: formData.totalDischargeamount,
        totalDischargeaverage: formData.totalDischargeaverage,
        machinedata: formData.machinesAvailability || [],
        remark: formData.remark || "",
        remarks: formData.remarks || Array(24).fill(""),
        turbinedata: formData.turbineData || [],
        totalPower: Number(formData.totalPower).toFixed(2),
        totalUnit: formData.unit ?? 0,
      };

      await axiosInstance.post("/daypowers", payload);
      resetForm();
      toast.success("Added successfully!");
      router.push("/declaration/day");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Submit failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="max-h-[550px] overflow-x-auto overflow-y-auto">
        <table className="table-auto border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800">
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border p-2 text-center whitespace-nowrap">
                Time Of Day (Hrs)
              </th>
              {(formData.turbineData || []).map((t, tIdx) => (
                <th
                  key={t.turbine}
                  className="w-[110px] border p-2 text-center whitespace-nowrap"
                >
                  <div className="flex flex-col items-center">
                    <span>Unit-{t.turbine} (MW)</span>
                    <textarea
                      onPaste={(e) => handlePaste(e, tIdx)}
                      placeholder="Paste 24 values"
                      className="mt-1 w-full rounded border p-1 text-xs"
                    />
                  </div>
                </th>
              ))}
              <th className="w-[130px] border p-2 text-center whitespace-nowrap">
                Total (MWh)
              </th>
              <th className="w-[180px] border p-2 text-center whitespace-nowrap">
                remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {hours.map((time, hIdx) => {
              const hourlyTotal = (formData.turbineData || []).reduce(
                (sum, turbine) =>
                  sum +
                  (typeof turbine.hourly[hIdx] === "number"
                    ? turbine.hourly[hIdx]
                    : 0),
                0,
              );

              return (
                <tr key={time}>
                  <td className="border p-2 text-center text-sm whitespace-nowrap">
                    {time}
                  </td>
                  {(formData.turbineData || []).map((t, tIdx) => {
                    const machine = machinesAvailability.find(
                      (m) => m.turbine === t.turbine,
                    );
                    return (
                      <td
                        key={`hourly-${t.turbine}-${hIdx}`}
                        className="border p-1 text-sm whitespace-nowrap"
                      >
                        <input
                          type="number"
                          value={t.hourly[hIdx] === 0 ? "" : t.hourly[hIdx]} // ถ้าเป็น 0 ให้แสดงว่าง
                          min={machine?.mins ?? 0}
                          max={machine?.maxs ?? 9999}
                          step="any"
                          onChange={(e) => {
                            const val = e.target.value;
                            // อนุญาตให้กรอกตัวเลขทศนิยม 2 ตำแหน่ง
                            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                              handleHourlyChange(tIdx, hIdx, val);
                            }
                          }}
                          onBlur={(e) => {
                            // ปรับเลขให้มี 2 ตำแหน่งทศนิยมตอนออกจาก input
                            const val = e.target.value;
                            if (val === "") {
                              // ถ้าเป็นค่าว่าง ให้เซ็ตเป็น 0
                              handleHourlyValidate(tIdx, hIdx, "0");
                            } else {
                              handleHourlyValidate(tIdx, hIdx, val);
                            }
                          }}
                          className="w-full rounded border px-1 py-1 placeholder:text-gray-900 dark:placeholder:text-gray-100"
                          placeholder="0"
                        />
                      </td>
                    );
                  })}
                  <td className="border bg-gray-50 p-2 text-center text-sm font-bold whitespace-nowrap dark:bg-gray-700">
                    {hourlyTotal.toFixed(2)} MWh
                  </td>
                  <td className="border p-1 text-sm whitespace-nowrap">
                    <input
                      type="text"
                      value={formData.remarks?.[hIdx] || ""}
                      onChange={(e) => handleRemarkChange(hIdx, e.target.value)}
                      className="w-full rounded border px-1 py-1"
                      placeholder="Remarks"
                    />
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-100 font-bold dark:bg-gray-800">
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
                {grandTotal.toFixed(2)} MWh
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
          value={formData.remark || ""}
          onChange={(e) => updateFormData({ remark: e.target.value })}
          className="w-full rounded border p-2"
          placeholder="Remark"
        ></textarea>
      </div>
      <div className="flex gap-3">
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
