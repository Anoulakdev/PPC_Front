"use client";

import { useEffect, useState, useMemo } from "react";
import { useDayPowerStore } from "@/store/dayPowerStore";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

export const Step2 = () => {
  const { formData, updateFormData, nextStep, prevStep } = useDayPowerStore();
  const unit = formData.unit || 1;

  const [maxs, setMaxs] = useState<number[]>(Array(unit).fill(0));
  const [mins, setMins] = useState<number[]>(Array(unit).fill(0));

  useEffect(() => {
    // ถ้ามี machinesAvailability แล้วให้ load มาลง input
    if (formData.machinesAvailability?.length) {
      const loadedMaxs = formData.machinesAvailability.map((m) => m.maxs);
      const loadedMins = formData.machinesAvailability.map((m) => m.mins);
      setMaxs(loadedMaxs);
      setMins(loadedMins);
    }
  }, [formData.machinesAvailability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const machinesAvailability = Array.from({ length: unit }, (_, idx) => ({
      turbine: idx + 1,
      maxs: maxs[idx],
      mins: mins[idx],
    }));

    updateFormData({ machinesAvailability }); // save to global state
    nextStep();
  };

  const handleMax = (index: number, value: string) => {
    const updated = [...maxs];
    updated[index] = parseFloat(value) || 0;
    setMaxs(updated);
  };

  const handleMin = (index: number, value: string) => {
    const updated = [...mins];
    updated[index] = parseFloat(value) || 0;
    setMins(updated);
  };

  const formatValue = (v: number | undefined) =>
    typeof v === "number" ? v.toFixed(2) : "0.00";

  const totalDischarge = useMemo(() => {
    const tdAmount =
      parseFloat((formData.turbineDischargeamount ?? "").toString()) || 0;
    const tdAverage =
      parseFloat((formData.turbineDischargeaverage ?? "").toString()) || 0;
    const sdAmount =
      parseFloat((formData.spillwayDischargeamount ?? "").toString()) || 0;
    const sdAverage =
      parseFloat((formData.spillwayDischargeaverage ?? "").toString()) || 0;
    const edAmount =
      parseFloat((formData.ecologicalDischargeamount ?? "").toString()) || 0;
    const edAverage =
      parseFloat((formData.ecologicalDischargeaverage ?? "").toString()) || 0;

    return {
      amount: tdAmount + sdAmount + edAmount,
      average: tdAverage + sdAverage + edAverage,
    };
  }, [
    formData.turbineDischargeamount,
    formData.turbineDischargeaverage,
    formData.spillwayDischargeamount,
    formData.spillwayDischargeaverage,
    formData.ecologicalDischargeamount,
    formData.ecologicalDischargeaverage,
  ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-sm font-bold">1. Machines Availability</h2>

      <div className="overflow-x-auto rounded-lg">
        <table className="table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-bold"></th>
              {Array.from({ length: unit }).map((_, index) => (
                <th key={index} className="w-[130px] px-4 py-3 text-center">
                  Unit-{index + 1} (MW)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2 font-semibold text-gray-700">MAX</td>
              {maxs.map((val, index) => (
                <td key={index} className="px-4 py-2">
                  <input
                    type="text"
                    value={formatValue(val)}
                    step="0.10"
                    onChange={(e) => handleMax(index, e.target.value)}
                    onBlur={(e) => {
                      const raw = parseFloat(e.target.value) || 0;
                      const fixed = parseFloat(raw.toFixed(2));
                      handleMax(index, fixed.toString());
                    }}
                    className="w-[130px] rounded border px-2 py-2 text-left"
                    required
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-2 font-semibold text-gray-700">MIN</td>
              {mins.map((val, index) => (
                <td key={index} className="px-4 py-2">
                  <input
                    type="number"
                    value={formatValue(val)}
                    step="0.10"
                    onChange={(e) => handleMin(index, e.target.value)}
                    onBlur={(e) => {
                      const raw = parseFloat(e.target.value) || 0;
                      const fixed = parseFloat(raw.toFixed(2));
                      handleMin(index, fixed.toString());
                    }}
                    className="w-[130px] rounded border px-2 py-2 text-left"
                    required
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <hr />

      <h2 className="text-sm font-bold">2. Reservoir Situation</h2>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <Label>Upstream Level (masl)</Label>
          <Input
            type="number"
            // inputMode="decimal"
            name="upstreamLevel"
            placeholder="masl"
            value={formatValue(formData.upstreamLevel || 0)} // แสดง 2 ตำแหน่ง
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                upstreamLevel: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
              updateFormData({ upstreamLevel: fixed });
            }}
            required
          />
        </div>

        <div>
          <Label>Downstream Level (masl)</Label>
          <Input
            type="number"
            // inputMode="decimal"
            name="downstreamLevel"
            placeholder="masl"
            value={formatValue(formData.downstreamLevel || 0)}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                downstreamLevel: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
              updateFormData({ downstreamLevel: fixed });
            }}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold">* Total Storage</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (MCM)</Label>
              <Input
                type="number"
                // inputMode="decimal"
                name="totalStorageamount"
                placeholder="MCM"
                value={formatValue(formData.totalStorageamount || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    totalStorageamount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ totalStorageamount: fixed });
                }}
                required
              />
            </div>

            <div>
              <Label>Percent ( % )</Label>
              <Input
                type="number"
                // inputMode="decimal"
                name="totalStorageaverage"
                placeholder="( % )"
                value={formatValue(formData.totalStorageaverage || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    totalStorageaverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ totalStorageaverage: fixed });
                }}
                required
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
                type="number"
                // inputMode="decimal"
                name="activeStorageamount"
                placeholder="MCM"
                value={formatValue(formData.activeStorageamount || 0)}
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
                // inputMode="decimal"
                name="activeStorageaverage"
                placeholder="( % )"
                value={formatValue(formData.activeStorageaverage || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    activeStorageaverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ activeStorageaverage: fixed });
                }}
                required
              />
            </div>
          </div>
        </div>
      </div>
      <hr />

      <h2 className="text-sm font-bold">3. Daily Water Discharge Plan</h2>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold">* Turbine Discharge</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (MCM)</Label>
              <Input
                type="number"
                // inputMode="decimal"
                name="turbineDischargeamount"
                placeholder="MCM"
                value={formatValue(formData.turbineDischargeamount || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    turbineDischargeamount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ turbineDischargeamount: fixed });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                // inputMode="decimal"
                name="turbineDischargeaverage"
                placeholder="(m³/s)"
                value={formatValue(formData.turbineDischargeaverage || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    turbineDischargeaverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ turbineDischargeaverage: fixed });
                }}
                required
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
                type="number"
                // inputMode="decimal"
                name="spillwayDischargeamount"
                placeholder="MCM"
                value={formatValue(formData.spillwayDischargeamount || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    spillwayDischargeamount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ spillwayDischargeamount: fixed });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                // inputMode="decimal"
                name="spillwayDischargeaverage"
                placeholder="(m³/s)"
                value={formatValue(formData.spillwayDischargeaverage || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    spillwayDischargeaverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ spillwayDischargeaverage: fixed });
                }}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold">* Ecological Discharge</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <Label>Amount (MCM)</Label>
              <Input
                type="number"
                // inputMode="decimal"
                name="ecologicalDischargeamount"
                placeholder="MCM"
                value={formatValue(formData.ecologicalDischargeamount || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    ecologicalDischargeamount: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ ecologicalDischargeamount: fixed });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                // inputMode="decimal"
                name="ecologicalDischargeaverage"
                placeholder="(m³/s)"
                value={formatValue(formData.ecologicalDischargeaverage || 0)}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    ecologicalDischargeaverage: isNaN(raw) ? 0 : raw, // อัปเดตระหว่างพิมพ์
                  });
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  const fixed = isNaN(raw) ? 0 : parseFloat(raw.toFixed(2)); // ตัดทศนิยมจริง
                  updateFormData({ ecologicalDischargeaverage: fixed });
                }}
                required
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

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </form>
  );
};
