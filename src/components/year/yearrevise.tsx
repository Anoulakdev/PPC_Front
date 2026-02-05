/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { decryptId } from "@/lib/cryptoId";
import { getLocalStorage } from "@/utils/storage";

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

const AUTO_CALC_PAIRS: [number, number][] = [
  [1, 2], // Active Storage Start Month: m³ → %
  [8, 9], // Active Storage End Month:   m³ → %
];

type User = {
  roleId: number;
};

export default function MonthRevise() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [power, setPower] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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
        const response = await axiosInstance.get(`/yearpowers/${decryptedId}`);
        const rawData = response.data;

        const clonedTurbines = rawData.powerCurrent.currentTurbines.map(
          (t: any) => ({
            ...t,
            tbody: [...t.tbody],
          }),
        );

        setData({
          ...rawData,
          currentTurbines: clonedTurbines,
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
    if (!data?.powerId) return;
    axiosInstance
      .get(`/powers/${data.powerId}`)
      .then((res) => setPower(res.data))
      .catch((err) => console.error("Fetch power error:", err));
  }, [data?.powerId]);

  /* ===== คำนวณ % อัดโนมัด จาก m³ ===== */
  const calcPercent = (m3Value: number | null): number | null => {
    const totalActive = power ? parseFloat(power.totalActiveFull) : null;
    if (m3Value == null || totalActive == null || totalActive === 0)
      return null;
    return parseFloat(((m3Value / totalActive) * 100).toFixed(2));
  };

  /* ===== UPDATE turbineData พร้อมกับ auto-calc ===== */
  const updateWithAutoCalc = (turbines: any[]) => {
    const result = turbines.map((col, colIdx) => {
      const pair = AUTO_CALC_PAIRS.find(
        ([, targetIdx]) => targetIdx === colIdx,
      );
      if (!pair) return col;

      const [sourceIdx] = pair;
      const sourceCol = turbines[sourceIdx];

      return {
        ...col,
        tbody: col.tbody.map((_: any, rIdx: number) =>
          calcPercent(sourceCol.tbody[rIdx]),
        ),
      };
    });

    setData((prev: any) => ({
      ...prev,
      currentTurbines: result,
    }));
  };

  const isAutoCalcTarget = (colIdx: number) =>
    AUTO_CALC_PAIRS.some(([, target]) => target === colIdx);

  const handleMonthlyChange = (
    colIdx: number,
    rowIdx: number,
    value: string,
  ) => {
    if (isAutoCalcTarget(colIdx)) return;

    const num = value === "" ? null : Number(value);

    updateWithAutoCalc(
      data.currentTurbines.map((col: any, cIdx: number) =>
        cIdx !== colIdx
          ? col
          : {
              ...col,
              tbody: col.tbody.map((v: any, rIdx: number) =>
                rIdx >= rowIdx ? num : v,
              ),
            },
      ),
    );
  };

  const handleMonthlyValidate = (
    colIdx: number,
    rowIdx: number,
    value: string,
  ) => {
    if (isAutoCalcTarget(colIdx)) return;

    const num = parseFloat(value);
    const fixed = isNaN(num) ? null : Number(num.toFixed(2));

    updateWithAutoCalc(
      data.currentTurbines.map((col: any, cIdx: number) =>
        cIdx !== colIdx
          ? col
          : {
              ...col,
              tbody: col.tbody.map((v: any, rIdx: number) =>
                rIdx >= rowIdx ? fixed : v,
              ),
            },
      ),
    );
  };

  const handleRevise = async () => {
    try {
      setLoading(true);

      const payload = {
        turbinedata: data.currentTurbines,
      };

      await axiosInstance.put(`/yearpowers/revise/${data?.id}`, payload);
      toast.success("Revise successfully");
      const redirectPath =
        user?.roleId === 4
          ? "/dispatch/year"
          : user?.roleId === 6
            ? "/declaration/year"
            : null;

      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Revise error:", error);
      toast.error("Revise failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
      <h1 className="mb-5 text-center text-xl font-bold">
        Yearly Availability Declaration (Revise)
      </h1>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto overflow-y-auto">
            <table className="table-auto border text-left">
              <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800">
                <tr className="bg-gray-100 text-xs dark:bg-gray-800">
                  <th className="border p-2 text-center" rowSpan={2}>
                    Month
                  </th>
                  {data?.currentTurbines.map((c: any, i: number) => (
                    <th key={i} className="border p-2 text-center">
                      {c.thead}
                    </th>
                  ))}
                </tr>
                <tr className="text-center text-xs">
                  {data?.currentTurbines.map((c: any, i: number) => (
                    <th key={i} className="border p-2">
                      {c.unit}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {months.map((m, rIdx) => (
                  <tr key={rIdx}>
                    <td className="sticky left-0 z-10 border bg-gray-100 p-2 text-center text-sm whitespace-nowrap dark:bg-gray-800">
                      {m}
                    </td>

                    {data?.currentTurbines.map((t: any, tIdx: number) => (
                      <td
                        key={`${tIdx}-${rIdx}`}
                        className="border p-1 text-sm whitespace-nowrap"
                      >
                        <input
                          type="number"
                          disabled={isAutoCalcTarget(tIdx)}
                          value={t.tbody[rIdx] ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^\d*\.?\d{0,2}$/.test(v)) {
                              handleMonthlyChange(tIdx, rIdx, v);
                            }
                          }}
                          onBlur={(e) =>
                            handleMonthlyValidate(tIdx, rIdx, e.target.value)
                          }
                          className={`w-[135px] rounded border px-1 py-1 placeholder:text-gray-900 dark:placeholder:text-gray-100 ${
                            isAutoCalcTarget(tIdx)
                              ? "cursor-not-allowed bg-gray-200 dark:bg-gray-700"
                              : ""
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleRevise}
            disabled={loading}
            className="mt-6 w-full rounded-md bg-blue-500 px-4 py-2 text-lg text-white hover:bg-blue-600"
          >
            {loading ? "Revise..." : "Revise"}
          </button>
        </>
      )}
    </div>
  );
}
