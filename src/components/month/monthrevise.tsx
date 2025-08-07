/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { decryptId } from "@/lib/cryptoId";
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

type User = {
  roleId: number;
};

export default function MonthRevise() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
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
        const response = await axiosInstance.get(`/monthpowers/${decryptedId}`);
        const rawData = response.data;

        const clonedTurbines = rawData.powerCurrent.currentTurbines.map(
          (t: any) => ({
            ...t,
            hourly: [...t.hourly],
          }),
        );

        const remarks = rawData.powerCurrent.remarks ?? Array(24).fill("");

        setData({
          ...rawData,
          currentTurbines: clonedTurbines,
          powerCurrent: {
            ...rawData.powerCurrent,
            remarks,
          },
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

  const handleHourlyChange = (tIdx: number, hourIdx: number, value: string) => {
    const updated = [...data.currentTurbines];
    const val = parseFloat(value) || 0;

    // แทนค่าทุกชั่วโมงตั้งแต่ hourIdx ถึง 23 ด้วยค่า val
    for (let i = hourIdx; i < 24; i++) {
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
      updated[tIdx].hourly[i] = values[i] ?? 0;
    }

    setData({ ...data, currentTurbines: updated });
  };

  const handleRemarkChange = (hourIdx: number, value: string) => {
    const updatedRemarks = [...(data?.powerCurrent?.remarks ?? [])];
    updatedRemarks[hourIdx] = value;
    setData({
      ...data,
      powerCurrent: {
        ...data.powerCurrent,
        remarks: updatedRemarks,
      },
    });
  };

  const handleMonthlyRemarkChange = (value: string) => {
    setData({
      ...data,
      powerCurrent: {
        ...data.powerCurrent,
        remark: value,
      },
    });
  };

  const handleHourlyValidate = (
    turbineIdx: number,
    hourIdx: number,
    value: string,
  ) => {
    const num = parseFloat(value) || 0;
    const updated = [...data.currentTurbines];
    for (let i = hourIdx; i < 24; i++) {
      updated[turbineIdx].hourly[i] = parseFloat(num.toFixed(2));
    }
    setData({
      ...data,
      currentTurbines: updated,
    });
  };

  const getTurbineTotal = (t: any) =>
    t.hourly.reduce((sum: number, v: number) => sum + v, 0);

  const getGrandTotal = () =>
    data?.currentTurbines.reduce(
      (grand: number, t: any) => grand + getTurbineTotal(t),
      0,
    );

  const handleRevise = async () => {
    try {
      setLoading(true);
      const payload = {
        turbinedata: data.currentTurbines,
        totalPower: getGrandTotal(),
        totalDate: data.powerCurrent?.totalDate,
        remark: data.powerCurrent?.remark ?? "",
        remarks: data.powerCurrent?.remarks ?? [],
      };
      await axiosInstance.put(`/monthpowers/revise/${data?.id}`, payload);
      toast.success("Revise successfully");
      const redirectPath =
        user?.roleId === 4
          ? "/dispatch/month"
          : user?.roleId === 6
            ? "/declaration/month"
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
        Monthly Availability Declaration (Revise)
      </h1>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table-auto border text-left">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border p-2 text-center whitespace-nowrap">
                    Time Of Day (Hrs)
                  </th>
                  {data?.currentTurbines.map((t: any, tIdx: number) => (
                    <th
                      key={t.turbine}
                      className="w-[130px] border p-2 text-center whitespace-nowrap"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm">Day-{t.turbine} (MW)</span>
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
                  const rowTotal =
                    data?.currentTurbines.reduce(
                      (sum: number, t: any) => sum + (t.hourly[hIdx] ?? 0),
                      0,
                    ) ?? 0;

                  return (
                    <tr key={hIdx}>
                      <td className="border p-2 text-center whitespace-nowrap">
                        {time}
                      </td>

                      {/* ค่า MW ต่อ Unit */}
                      {data?.currentTurbines.map((t: any, tIdx: number) => {
                        return (
                          <td
                            key={`cell-${t.turbine}-${hIdx}`}
                            className="border p-1 whitespace-nowrap"
                          >
                            <input
                              type="text"
                              value={t.hourly[hIdx].toFixed(2)}
                              onChange={(e) =>
                                handleHourlyChange(tIdx, hIdx, e.target.value)
                              }
                              onBlur={(e) => {
                                // ปรับเลขให้มี 2 ตำแหน่งตอนออกจาก input
                                let val = parseFloat(e.target.value) || 0;
                                val = parseFloat(val.toFixed(2)); // ตัดทศนิยม 2 ตำแหน่งจริง ๆ
                                handleHourlyValidate(
                                  tIdx,
                                  hIdx,
                                  val.toString(),
                                );
                              }}
                              className="w-full rounded border px-1 py-1"
                              placeholder="MW"
                            />
                          </td>
                        );
                      })}

                      {/* Total ของแถวนั้น (MW รวมของชั่วโมงนั้น) */}
                      <td className="border bg-gray-50 px-2 py-1 text-center font-semibold dark:bg-gray-700">
                        {rowTotal.toFixed(2)}
                      </td>

                      {/* Remark ต่อชั่วโมง */}
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={data?.powerCurrent?.remarks?.[hIdx] ?? ""}
                          onChange={(e) =>
                            handleRemarkChange(hIdx, e.target.value)
                          }
                          className="w-[180px] rounded border px-1 py-1 text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
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
                    {(getGrandTotal() || 0).toFixed(2)} MWh
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
              value={data?.powerCurrent?.remark || ""}
              onChange={(e) => handleMonthlyRemarkChange(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="Remark"
            ></textarea>
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
