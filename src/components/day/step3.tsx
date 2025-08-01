"use client";
import { useDayPowerStore } from "@/store/dayPowerStore";
import { useState, useEffect } from "react";
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
    let num = parseFloat(value) || 0;
    const turbine = formData.turbineData[turbineIdx].turbine;
    const machine = machinesAvailability.find((m) => m.turbine === turbine);

    if (machine) {
      if (num < machine.mins) num = machine.mins;
      if (num > machine.maxs) num = machine.maxs;
    }

    const updated = [...formData.turbineData];

    // ใช้ค่า validated กับ index ตั้งแต่ hourIdx ถึง 23
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
      if (machine) {
        if (val < machine.mins) val = machine.mins;
        if (val > machine.maxs) val = machine.maxs;
      }
      updated[turbineIdx].hourly[i] = val;
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

  const toFixed2 = (n: number | undefined | null) =>
    parseFloat((n ?? 0).toFixed(2));

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
        upstreamLevel: toFixed2(formData.upstreamLevel),
        downstreamLevel: toFixed2(formData.downstreamLevel),
        totalStorageamount: toFixed2(formData.totalStorageamount),
        totalStorageaverage: toFixed2(formData.totalStorageaverage),
        activeStorageamount: toFixed2(formData.activeStorageamount),
        activeStorageaverage: toFixed2(formData.activeStorageaverage),
        turbineDischargeamount: toFixed2(formData.turbineDischargeamount),
        turbineDischargeaverage: toFixed2(formData.turbineDischargeaverage),
        spillwayDischargeamount: toFixed2(formData.spillwayDischargeamount),
        spillwayDischargeaverage: toFixed2(formData.spillwayDischargeaverage),
        ecologicalDischargeamount: toFixed2(formData.ecologicalDischargeamount),
        ecologicalDischargeaverage: toFixed2(
          formData.ecologicalDischargeaverage,
        ),
        machinedata: formData.machinesAvailability || [],
        remark: formData.remark || "",
        remarks: formData.remarks || Array(24).fill(""),
        turbinedata: formData.turbineData || [],
        totalPower: toFixed2(formData.totalPower),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table-auto border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-center whitespace-nowrap">
                Time Of Day (Hrs)
              </th>
              {(formData.turbineData || []).map((t, tIdx) => (
                <th
                  key={t.turbine}
                  className="w-[130px] border p-2 text-center whitespace-nowrap"
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
                (sum, turbine) => sum + (turbine.hourly[hIdx] || 0),
                0,
              );

              return (
                <tr key={time}>
                  <td className="border p-2 text-center whitespace-nowrap">
                    {time}
                  </td>
                  {(formData.turbineData || []).map((t, tIdx) => {
                    const machine = machinesAvailability.find(
                      (m) => m.turbine === t.turbine,
                    );
                    return (
                      <td
                        key={`hourly-${t.turbine}-${hIdx}`}
                        className="border p-1 whitespace-nowrap"
                      >
                        <input
                          type="text"
                          value={t.hourly[hIdx].toFixed(2)} // แสดง 2 ตำแหน่งทศนิยม
                          min={machine?.mins ?? 0}
                          max={machine?.maxs ?? 9999}
                          step="0.10"
                          onChange={(e) =>
                            handleHourlyChange(tIdx, hIdx, e.target.value)
                          }
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
                  <td className="border bg-gray-50 p-2 text-center font-bold whitespace-nowrap">
                    {hourlyTotal.toFixed(2)} MWh
                  </td>
                  <td className="border p-1 whitespace-nowrap">
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
            <tr className="bg-gray-100 font-bold">
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
