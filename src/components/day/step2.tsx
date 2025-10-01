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

  // const formatValue = (v: number | undefined) =>
  //   typeof v === "number" ? v.toFixed(2) : "0.00";

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
                    type="number"
                    value={val}
                    onChange={(e) => handleMax(index, e.target.value)}
                    onBlur={(e) => {
                      const raw = parseFloat(e.target.value) || 0;
                      handleMax(index, raw.toString());
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
                    value={val}
                    onChange={(e) => handleMin(index, e.target.value)}
                    onBlur={(e) => {
                      const raw = parseFloat(e.target.value) || 0;
                      handleMin(index, raw.toString());
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
            name="upstreamLevel"
            placeholder="0.00"
            value={formData.upstreamLevel ?? ""}
            onChange={(e) => {
              updateFormData({
                upstreamLevel: e.target.value,
              });
            }}
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({
                upstreamLevel: isNaN(raw) ? "" : raw,
              });
            }}
            required
          />
        </div>

        <div>
          <Label>Downstream Level (masl)</Label>
          <Input
            type="number"
            name="downstreamLevel"
            placeholder="0.00"
            value={formData.downstreamLevel ?? ""}
            onChange={(e) =>
              updateFormData({ downstreamLevel: e.target.value })
            }
            onBlur={(e) => {
              const raw = parseFloat(e.target.value);
              updateFormData({ downstreamLevel: isNaN(raw) ? "" : raw });
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
                name="totalStorageamount"
                placeholder="0.00"
                value={formData.totalStorageamount ?? ""}
                onChange={(e) =>
                  updateFormData({ totalStorageamount: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({ totalStorageamount: isNaN(raw) ? "" : raw });
                }}
                required
              />
            </div>

            <div>
              <Label>Percent ( % )</Label>
              <Input
                type="number"
                name="totalStorageaverage"
                placeholder="0.00"
                value={formData.totalStorageaverage ?? ""}
                onChange={(e) =>
                  updateFormData({ totalStorageaverage: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    totalStorageaverage: isNaN(raw) ? "" : raw,
                  });
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
                name="activeStorageamount"
                placeholder="0.00"
                value={formData.activeStorageamount ?? ""}
                onChange={(e) =>
                  updateFormData({ activeStorageamount: e.target.value })
                }
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
                name="activeStorageaverage"
                placeholder="0.00"
                value={formData.activeStorageaverage ?? ""}
                onChange={(e) =>
                  updateFormData({ activeStorageaverage: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    activeStorageaverage: isNaN(raw) ? "" : raw,
                  });
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
                name="turbineDischargeamount"
                placeholder="0.00"
                value={formData.turbineDischargeamount ?? ""}
                onChange={(e) =>
                  updateFormData({ turbineDischargeamount: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    turbineDischargeamount: isNaN(raw) ? "" : raw,
                  });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                name="turbineDischargeaverage"
                placeholder="0.00"
                value={formData.turbineDischargeaverage ?? ""}
                onChange={(e) =>
                  updateFormData({ turbineDischargeaverage: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    turbineDischargeaverage: isNaN(raw) ? "" : raw,
                  });
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
                name="spillwayDischargeamount"
                placeholder="0.00"
                value={formData.spillwayDischargeamount ?? ""}
                onChange={(e) =>
                  updateFormData({ spillwayDischargeamount: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    spillwayDischargeamount: isNaN(raw) ? "" : raw,
                  });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                name="spillwayDischargeaverage"
                placeholder="0.00"
                value={formData.spillwayDischargeaverage ?? ""}
                onChange={(e) =>
                  updateFormData({ spillwayDischargeaverage: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    spillwayDischargeaverage: isNaN(raw) ? "" : raw,
                  });
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
                name="ecologicalDischargeamount"
                placeholder="0.00"
                value={formData.ecologicalDischargeamount ?? ""}
                onChange={(e) =>
                  updateFormData({ ecologicalDischargeamount: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    ecologicalDischargeamount: isNaN(raw) ? "" : raw,
                  });
                }}
                required
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="number"
                name="ecologicalDischargeaverage"
                placeholder="0.00"
                value={formData.ecologicalDischargeaverage ?? ""}
                onChange={(e) =>
                  updateFormData({ ecologicalDischargeaverage: e.target.value })
                }
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  updateFormData({
                    ecologicalDischargeaverage: isNaN(raw) ? "" : raw,
                  });
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
                value={` ${totalDischarge.amount} MCM `}
              />
            </div>

            <div>
              <Label>Average (m³/s)</Label>
              <Input
                type="text"
                disabled
                className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                value={`${totalDischarge.average} m³/s`}
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
