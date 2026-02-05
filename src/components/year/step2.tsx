"use client";

import { useState, useEffect } from "react";
import { useYearPowerStore } from "@/store/yearPowerStore";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

/* ================= CONSTANTS ================= */

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ===== COLUMN CONFIG ===== */

const turbineColumns = [
  { label: "Reservoir Level Start Month", unit: "masl" },
  { label: "Active Storage Start Month", unit: "m³" },
  { label: "Active Storage Start Month", unit: "%" },
  { label: "Inflow", unit: "m³" },
  { label: "Discharge From Powerhouse", unit: "m³" },
  { label: "Discharge From Spillway", unit: "m³" },
  { label: "Evaporation", unit: "m³" },
  { label: "Environmental or Other Discharge", unit: "m³" },
  { label: "Active Storage End Month", unit: "m³" },
  { label: "Active Storage End Month", unit: "%" },
  { label: "Reservoir Level End Month", unit: "masl" },
  { label: "Power Production", unit: "GWh" },
  { label: "Energy base on PPA", unit: "GWh" },
  { label: "Water Using Rated Design", unit: "m³/kWh" },
  { label: "Water Using Rated Plan", unit: "m³/kWh" },
  { label: "Average inflow/day", unit: "m³" },
];

// คู่ mapping: [sourceIndex (m³), targetIndex (%)]
const AUTO_CALC_PAIRS: [number, number][] = [
  [1, 2], // Active Storage Start Month: m³ → %
  [8, 9], // Active Storage End Month:   m³ → %
];

/* ================= COMPONENT ================= */

type Power = {
  id: number;
  totalActiveFull: string;
};

export const Step2 = () => {
  const { formData, updateFormData, prevStep, resetForm } = useYearPowerStore();
  const [data, setData] = useState<Power | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (formData.powerId != null) {
      axiosInstance
        .get(`/powers/${formData.powerId}`)
        .then((res) => setData(res.data))
        .catch((err) => console.error("Fetch power error:", err));
    }
  }, [formData.powerId]);

  /* ===== INIT turbineData ===== */
  useEffect(() => {
    if (!formData.turbineData.length) {
      updateFormData({
        turbineData: turbineColumns.map((col) => ({
          thead: col.label,
          unit: col.unit,
          tbody: Array(months.length).fill(null),
        })),
      });
    }
  }, [formData.turbineData.length, updateFormData]);

  /* ===== คำนวณ % อัดโนมัด จาก m³ ===== */
  const calcPercent = (m3Value: number | null): number | null => {
    const totalActive = data ? parseFloat(data.totalActiveFull) : null;
    if (m3Value == null || totalActive == null || totalActive === 0)
      return null;
    return parseFloat(((m3Value / totalActive) * 100).toFixed(2));
  };

  /* ===== UPDATE turbineData พร้อมกับ auto-calc ===== */
  const updateWithAutoCalc = (
    updatedTurbineData: typeof formData.turbineData,
  ) => {
    const result = updatedTurbineData.map((col, colIdx) => {
      // หาว่า colIdx นี้เป็น target (%) ของ source (m³) ไหม
      const pair = AUTO_CALC_PAIRS.find(
        ([, targetIdx]) => targetIdx === colIdx,
      );
      if (!pair) return col; // ไม่ใช่ auto-calc column → คงเดิม

      const [sourceIdx] = pair;
      const sourceCol = updatedTurbineData[sourceIdx];

      return {
        ...col,
        tbody: col.tbody.map((_, rIdx) => calcPercent(sourceCol.tbody[rIdx])),
      };
    });

    updateFormData({ turbineData: result });
  };

  /* ===== เช็ค column นั้นเป็น auto-calc target ไหม (ถ้าใช่ → disable input) ===== */
  const isAutoCalcTarget = (colIdx: number): boolean =>
    AUTO_CALC_PAIRS.some(([, targetIdx]) => targetIdx === colIdx);

  /* ===== CHANGE HANDLER ===== */
  const handleMonthlyChange = (
    colIdx: number,
    rowIdx: number,
    value: string,
  ) => {
    if (isAutoCalcTarget(colIdx)) return; // skip auto columns

    const num = value === "" ? null : Number(value);

    updateWithAutoCalc(
      formData.turbineData.map((col, cIdx) =>
        cIdx !== colIdx
          ? col
          : {
              ...col,
              // rowIdx เทิง → fill down ทุกเดือนถ้าไป
              tbody: col.tbody.map((v, rIdx) => (rIdx >= rowIdx ? num : v)),
            },
      ),
    );
  };

  /* ===== BLUR HANDLER (format to 2 decimal) ===== */
  const handleMonthlyValidate = (
    colIdx: number,
    rowIdx: number,
    value: string,
  ) => {
    if (isAutoCalcTarget(colIdx)) return;

    const num = parseFloat(value);
    const fixed = isNaN(num) ? null : Number(num.toFixed(2));

    updateWithAutoCalc(
      formData.turbineData.map((col, cIdx) =>
        cIdx !== colIdx
          ? col
          : {
              ...col,
              // onBlur ก็ fill down เดียวกัน เพื่อให้ format ครบ
              tbody: col.tbody.map((v, rIdx) => (rIdx >= rowIdx ? fixed : v)),
            },
      ),
    );
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // ===== validate: ทุก cell ต้องมี value (ยกเว้น auto-calc columns) =====
    const autoTargets = new Set(AUTO_CALC_PAIRS.map(([, t]) => t));

    for (let colIdx = 0; colIdx < formData.turbineData.length; colIdx++) {
      if (autoTargets.has(colIdx)) continue; // skip auto columns

      const col = formData.turbineData[colIdx];
      for (let rIdx = 0; rIdx < months.length; rIdx++) {
        if (col.tbody[rIdx] == null || isNaN(col.tbody[rIdx]!)) {
          toast.error(`Please add all filled values before submitting.`);
          return;
        }
      }
    }
    // ===== end validate =====

    setIsSubmitting(true);
    try {
      const payload = {
        powerId: formData.powerId,
        sYear: formData.sYear,
        powerNo: formData.abbreviation,
        turbinedata: formData.turbineData,
      };

      await axiosInstance.post("/yearpowers", payload);
      resetForm();
      toast.success("Added successfully");
      router.push("/declaration/year");
    } catch (err) {
      console.error(err);
      toast.error("Submit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="overflow-x-auto overflow-y-auto">
        <table className="table-auto border text-left">
          {/* ===== THEAD ===== */}
          <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800">
            <tr className="bg-gray-100 text-xs dark:bg-gray-800">
              <th className="border p-2 text-center" rowSpan={2}>
                Month
              </th>
              {formData.turbineData.map((col, idx) => (
                <th key={idx} className="border p-2 text-center">
                  {col.thead}
                </th>
              ))}
            </tr>
            <tr className="text-center text-xs">
              {formData.turbineData.map((col, idx) => (
                <th key={idx} className="border p-2">
                  {col.unit}
                </th>
              ))}
            </tr>
          </thead>

          {/* ===== TBODY ===== */}
          <tbody>
            {months.map((m, rIdx) => (
              <tr key={m}>
                <td className="sticky left-0 z-10 border bg-gray-100 p-2 text-center text-sm whitespace-nowrap dark:bg-gray-800">
                  {m}
                </td>

                {formData.turbineData.map((col, colIdx) => {
                  const isAuto = isAutoCalcTarget(colIdx);

                  return (
                    <td
                      key={colIdx}
                      className="border p-1 text-sm whitespace-nowrap"
                    >
                      <input
                        type="number"
                        className={`w-[135px] rounded border px-1 py-1 placeholder:text-gray-900 dark:placeholder:text-gray-100 ${
                          isAuto
                            ? "cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                            : ""
                        }`}
                        value={col.tbody[rIdx] ?? ""}
                        onChange={(e) => {
                          if (isAuto) return; // block manual input
                          const val = e.target.value;
                          if (/^\d*\.?\d{0,2}$/.test(val)) {
                            handleMonthlyChange(colIdx, rIdx, val);
                          }
                        }}
                        onBlur={(e) => {
                          if (isAuto) return;
                          let val = parseFloat(e.target.value) || 0;
                          val = parseFloat(val.toFixed(2));
                          handleMonthlyValidate(colIdx, rIdx, val.toString());
                        }}
                        disabled={isAuto}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== ACTIONS ===== */}
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
