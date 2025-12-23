/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useDayPowerStore } from "@/store/dayPowerStore";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import axiosInstance from "@/utils/axiosInstance";

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

export const Step2 = () => {
  const { formData, updateFormData, nextStep, prevStep } = useDayPowerStore();
  const unit = formData.unit || 1;

  const [maxs, setMaxs] = useState<number[]>(Array(unit).fill(0));
  const [mins, setMins] = useState<number[]>(Array(unit).fill(0));

  const [data, setData] = useState<Power | null>(null);
  const [editingTD, setEditingTD] = useState<"amount" | "average" | null>(null);
  const [editingSW, setEditingSW] = useState<"amount" | "average" | null>(null);
  const [editingED, setEditingED] = useState<"amount" | "average" | null>(null);

  useEffect(() => {
    if (formData.powerId != null) {
      axiosInstance
        .get(`/powers/${formData.powerId}`)
        .then((res) => setData(res.data))
        .catch((err) => console.error("Fetch power error:", err));
    }
  }, [formData.powerId]);

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
      amount: Number((tdAmount + sdAmount + edAmount).toFixed(2)),
      average: Number((tdAverage + sdAverage + edAverage).toFixed(2)),
    };
  }, [
    formData.turbineDischargeamount,
    formData.turbineDischargeaverage,
    formData.spillwayDischargeamount,
    formData.spillwayDischargeaverage,
    formData.ecologicalDischargeamount,
    formData.ecologicalDischargeaverage,
  ]);

  useEffect(() => {
    updateFormData({
      totalDischargeamount: totalDischarge.amount,
      totalDischargeaverage: totalDischarge.average,
    });
  }, [totalDischarge, updateFormData]);

  useEffect(() => {
    if (!data) return;

    const totalStorageAmount =
      parseFloat((formData.totalStorageamount ?? "").toString()) || 0;
    const totalStorageFull =
      parseFloat((data.totalStorageFull ?? "").toString()) || 0;

    const activeStorageAmount =
      parseFloat((formData.activeStorageamount ?? "").toString()) || 0;
    const activeStorageFull =
      parseFloat((data.totalActiveFull ?? "").toString()) || 0;

    updateFormData({
      totalStorageaverage:
        totalStorageFull > 0
          ? Number(((totalStorageAmount / totalStorageFull) * 100).toFixed(2))
          : 0,

      activeStorageaverage:
        activeStorageFull > 0
          ? Number(((activeStorageAmount / activeStorageFull) * 100).toFixed(2))
          : 0,
    });
  }, [
    formData.totalStorageamount,
    formData.activeStorageamount,
    data?.totalStorageFull,
    data?.totalActiveFull,
  ]);

  // ------------------------------------------

  useEffect(() => {
    if (editingTD === "amount" && formData.turbineDischargeamount != null) {
      const turbineDischargeaverage =
        Number(formData.turbineDischargeamount) / (24 * 3600);
      updateFormData({
        turbineDischargeaverage: Number(turbineDischargeaverage.toFixed(2)),
      });
    } else if (
      editingTD === "average" &&
      formData.turbineDischargeaverage != null
    ) {
      const turbineDischargeamount =
        Number(formData.turbineDischargeaverage) * 24 * 3600;
      updateFormData({
        turbineDischargeamount: Number(turbineDischargeamount.toFixed(2)),
      });
    }
  }, [
    formData.turbineDischargeamount,
    formData.turbineDischargeaverage,
    editingTD,
  ]);

  useEffect(() => {
    if (
      (formData.turbineDischargeamount ?? 0) === 0 &&
      (formData.turbineDischargeaverage ?? 0) === 0
    ) {
      setEditingTD(null);
    }
  }, [formData.turbineDischargeamount, formData.turbineDischargeaverage]);

  // ------------------------------------------------------------

  useEffect(() => {
    if (editingSW === "amount" && formData.spillwayDischargeamount != null) {
      const spillwayDischargeaverage =
        Number(formData.spillwayDischargeamount) / (24 * 3600);
      updateFormData({
        spillwayDischargeaverage: Number(spillwayDischargeaverage.toFixed(2)),
      });
    } else if (
      editingSW === "average" &&
      formData.spillwayDischargeaverage != null
    ) {
      const spillwayDischargeamount =
        Number(formData.spillwayDischargeaverage) * 24 * 3600;
      updateFormData({
        spillwayDischargeamount: Number(spillwayDischargeamount.toFixed(2)),
      });
    }
  }, [
    formData.spillwayDischargeamount,
    formData.spillwayDischargeaverage,
    editingSW,
  ]);

  useEffect(() => {
    if (
      (formData.spillwayDischargeamount ?? 0) === 0 &&
      (formData.spillwayDischargeaverage ?? 0) === 0
    ) {
      setEditingSW(null);
    }
  }, [formData.spillwayDischargeamount, formData.spillwayDischargeaverage]);

  // ------------------------------------------------------------

  useEffect(() => {
    if (editingED === "amount" && formData.ecologicalDischargeamount != null) {
      const ecologicalDischargeaverage =
        Number(formData.ecologicalDischargeamount) / (24 * 3600);
      updateFormData({
        ecologicalDischargeaverage: Number(
          ecologicalDischargeaverage.toFixed(2),
        ),
      });
    } else if (
      editingED === "average" &&
      formData.ecologicalDischargeaverage != null
    ) {
      const ecologicalDischargeamount =
        Number(formData.ecologicalDischargeaverage) * 24 * 3600;
      updateFormData({
        ecologicalDischargeamount: Number(ecologicalDischargeamount.toFixed(2)),
      });
    }
  }, [
    formData.ecologicalDischargeamount,
    formData.ecologicalDischargeaverage,
    editingED,
  ]);

  useEffect(() => {
    if (
      (formData.ecologicalDischargeamount ?? 0) === 0 &&
      (formData.ecologicalDischargeaverage ?? 0) === 0
    ) {
      setEditingED(null);
    }
  }, [formData.ecologicalDischargeamount, formData.ecologicalDischargeaverage]);

  // ------------------------------------------------------------

  useEffect(() => {
    if (data && data.fuelId !== 1) {
      updateFormData({
        upstreamLevel: 0,
        downstreamLevel: 0,
        totalStorageamount: 0,
        totalStorageaverage: 0,
        activeStorageamount: 0,
        activeStorageaverage: 0,
        turbineDischargeamount: 0,
        turbineDischargeaverage: 0,
        spillwayDischargeamount: 0,
        spillwayDischargeaverage: 0,
        ecologicalDischargeamount: 0,
        ecologicalDischargeaverage: 0,
        totalDischargeamount: 0,
        totalDischargeaverage: 0,
      });
    }
  }, [data?.fuelId]);

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

      {data?.fuelId === 1 && (
        <>
          <h2 className="text-sm font-bold">2. Reservoir Situation (00:00)</h2>

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
                  <Label>Amount (m³)</Label>
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
                      updateFormData({
                        totalStorageamount: isNaN(raw) ? "" : raw,
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
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={`${Number(formData.totalStorageaverage ?? 0).toFixed(2)}`}
                  />
                </div>
              </div>
            </div>

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
                    disabled
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={`${Number(formData.activeStorageaverage ?? 0).toFixed(2)}`}
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
                  <Label>Amount (m³)</Label>
                  <Input
                    type="number"
                    name="turbineDischargeamount"
                    placeholder="0.00"
                    value={formData.turbineDischargeamount ?? ""}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);

                      if (e.target.value === "") {
                        // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                        updateFormData({
                          turbineDischargeamount: "",
                          turbineDischargeaverage: "",
                        });
                        setEditingTD(null);
                      } else {
                        updateFormData({
                          turbineDischargeamount: isNaN(raw)
                            ? ""
                            : Number(raw.toFixed(2)),
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
                    name="turbineDischargeaverage"
                    placeholder="0.00"
                    value={formData.turbineDischargeaverage ?? ""}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);

                      if (e.target.value === "") {
                        // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                        updateFormData({
                          turbineDischargeamount: "",
                          turbineDischargeaverage: "",
                        });
                        setEditingTD(null);
                      } else {
                        updateFormData({
                          turbineDischargeaverage: isNaN(raw)
                            ? ""
                            : Number(raw.toFixed(2)),
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

            <div>
              <h2 className="text-sm font-bold">* Spillway Discharge</h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Amount (m³)</Label>
                  <Input
                    type="number"
                    name="spillwayDischargeamount"
                    placeholder="0.00"
                    value={formData.spillwayDischargeamount ?? ""}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);

                      if (e.target.value === "") {
                        // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                        updateFormData({
                          spillwayDischargeamount: "",
                          spillwayDischargeaverage: "",
                        });
                        setEditingSW(null);
                      } else {
                        updateFormData({
                          spillwayDischargeamount: isNaN(raw)
                            ? ""
                            : Number(raw.toFixed(2)),
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
                    name="spillwayDischargeaverage"
                    placeholder="0.00"
                    value={formData.spillwayDischargeaverage ?? ""}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);

                      if (e.target.value === "") {
                        // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                        updateFormData({
                          spillwayDischargeamount: "",
                          spillwayDischargeaverage: "",
                        });
                        setEditingSW(null);
                      } else {
                        updateFormData({
                          spillwayDischargeaverage: isNaN(raw)
                            ? ""
                            : Number(raw.toFixed(2)),
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
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold">* Ecological Discharge</h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Amount (m³)</Label>
                  <Input
                    type="number"
                    name="ecologicalDischargeamount"
                    placeholder="0.00"
                    value={formData.ecologicalDischargeamount ?? ""}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);

                      if (e.target.value === "") {
                        // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                        updateFormData({
                          ecologicalDischargeamount: "",
                          ecologicalDischargeaverage: "",
                        });
                        setEditingED(null);
                      } else {
                        updateFormData({
                          ecologicalDischargeamount: isNaN(raw)
                            ? ""
                            : Number(raw.toFixed(2)),
                        });
                        setEditingED("amount");
                      }
                    }}
                    readOnly={editingED === "average"}
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
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);

                      if (e.target.value === "") {
                        // ถ้าลบจนว่าง → เคลียร์ทั้งคู่
                        updateFormData({
                          ecologicalDischargeamount: "",
                          ecologicalDischargeaverage: "",
                        });
                        setEditingED(null);
                      } else {
                        updateFormData({
                          ecologicalDischargeaverage: isNaN(raw)
                            ? ""
                            : Number(raw.toFixed(2)),
                        });
                        setEditingED("average");
                      }
                    }}
                    readOnly={editingED === "amount"}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold">* Total Discharge</h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Amount (m³)</Label>
                  <Input
                    type="number"
                    disabled
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={`${totalDischarge.amount}`}
                  />
                </div>

                <div>
                  <Label>Average (m³/s)</Label>
                  <Input
                    type="number"
                    disabled
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700"
                    value={`${totalDischarge.average}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
