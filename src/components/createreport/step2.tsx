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

export const Step2 = () => {
  const { formData, updateFormData, prevStep, resetForm } =
    useCreateReportStore();
  const unit = formData.totalUnit || 1;
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

  const formatValue = (v: number | undefined) =>
    typeof v === "number" ? v.toFixed(2) : "0.00";

  useEffect(() => {
    updateFormData({
      activeStorageaverage: 0,
      dwy: 0,
      dwf: 0,
      dwm: 0,
      pws: 0,
      waterRate: 0,
    });
  }, []);

  const toFixed2 = (n: number | undefined | null) =>
    parseFloat((n ?? 0).toFixed(2));

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
        activeStorageamount: toFixed2(formData.activeStorageamount),
        activeStorageaverage: toFixed2(formData.activeStorageaverage),
        waterLevel: toFixed2(formData.waterLevel),
        dwy: toFixed2(formData.dwy),
        dwf: toFixed2(formData.dwf),
        dwm: toFixed2(formData.dwm),
        pws: toFixed2(formData.pws),
        inflowamount: toFixed2(formData.inflowamount),
        inflowaverage: toFixed2(formData.inflowaverage),
        outflowamount: toFixed2(formData.outflowamount),
        outflowaverage: toFixed2(formData.outflowaverage),
        spillwayamount: toFixed2(formData.spillwayamount),
        spillwayaverage: toFixed2(formData.spillwayaverage),
        owramount: toFixed2(formData.owramount),
        owraverage: toFixed2(formData.owraverage),
        rainFall: toFixed2(formData.rainFall),
        netEnergyOutput: toFixed2(formData.netEnergyOutput),
        waterRate: toFixed2(formData.waterRate),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table-auto text-left">
          <thead>
            <tr className="bg-gray-100">
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
                          type="text"
                          value={t.hourly[hIdx].toFixed(2)} // แสดง 2 ตำแหน่งทศนิยม
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
            <tr className="bg-gray-50 font-bold">
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
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold">* Active Storage</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (MCM)</Label>
              <Input
                type="number"
                name="activeStorageamount"
                placeholder="MCM"
                value={formatValue(formData.activeStorageamount ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    activeStorageamount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ activeStorageamount: fixed });
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
                value={formatValue(formData.activeStorageaverage ?? 0)}
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
            value={formatValue(formData.waterLevel ?? 0)}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                waterLevel: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
              updateFormData({ waterLevel: fixed });
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
            value={formatValue(formData.dwy ?? 0)}
          />
        </div>

        <div>
          <Label>Diff with Full (m)</Label>
          <Input
            type="number"
            disabled
            name="dwf"
            className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
            value={formatValue(formData.dwf ?? 0)}
          />
        </div>

        <div>
          <Label>Diff with Min (m)</Label>
          <Input
            type="number"
            disabled
            name="dwm"
            className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
            value={formatValue(formData.dwm ?? 0)}
          />
        </div>

        <div>
          <Label>Potential Water Storage (MCM)</Label>
          <Input
            type="number"
            disabled
            name="pws"
            className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
            value={formatValue(formData.pws ?? 0)}
          />
        </div>
      </div>
      <hr />

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold">* InFlow</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (MCM)</Label>
              <Input
                type="number"
                name="inflowamount"
                value={formatValue(formData.inflowamount ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    inflowamount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ inflowamount: fixed });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                name="inflowaverage"
                value={formatValue(formData.inflowaverage ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    inflowaverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ inflowaverage: fixed });
                }}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold">* OutFlow</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (MCM)</Label>
              <Input
                type="number"
                name="outflowamount"
                value={formatValue(formData.outflowamount ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    outflowamount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ outflowamount: fixed });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                name="outflowaverage"
                value={formatValue(formData.outflowaverage ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    outflowaverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ outflowaverage: fixed });
                }}
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
              <Label>Amount (MCM)</Label>
              <Input
                type="number"
                name="spillwayamount"
                value={formatValue(formData.spillwayamount ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    spillwayamount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ spillwayamount: fixed });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                name="spillwayaverage"
                value={formatValue(formData.spillwayaverage ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    spillwayaverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ spillwayaverage: fixed });
                }}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold">* Other Water Released</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (MCM)</Label>
              <Input
                type="number"
                name="owramount"
                value={formatValue(formData.owramount ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    owramount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ owramount: fixed });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                name="owraverage"
                value={formatValue(formData.owraverage ?? 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    owraverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ owraverage: fixed });
                }}
                required
              />
            </div>
          </div>
        </div>
      </div>
      <hr />

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>Rain fall (mm)</Label>
            <Input
              type="number"
              name="rainFall"
              value={formatValue(formData.rainFall ?? 0)}
              onChange={(e) => {
                const raw = parseFloat(e.target.value);
                updateFormData({
                  rainFall: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                });
              }}
              onBlur={(e) => {
                const raw = parseFloat(e.target.value);
                const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                updateFormData({ rainFall: fixed });
              }}
              required
            />
          </div>

          <div>
            <Label>Net Energy Output (NEO)</Label>
            <Input
              type="number"
              name="netEnergyOutput"
              value={formatValue(formData.netEnergyOutput ?? 0)}
              onChange={(e) => {
                const raw = parseFloat(e.target.value);
                updateFormData({
                  netEnergyOutput: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                });
              }}
              onBlur={(e) => {
                const raw = parseFloat(e.target.value);
                const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                updateFormData({ netEnergyOutput: fixed });
              }}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>Water Rate (m³/s)</Label>
            <Input
              type="number"
              disabled
              name="waterRate"
              className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
              value={formatValue(formData.waterRate ?? 0)}
            />
          </div>
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
