/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import DatePicker from "@/components/form/date-picker";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { useDayPowerStore } from "@/store/dayPowerStore";
import axiosInstance from "@/utils/axiosInstance";
import moment from "moment";

type Power = {
  id: number;
  name: string;
  abbreviation: string;
  unit: number;
};

type User = {
  powers: { power: Power }[];
};

export const Step1 = () => {
  const { formData, updateFormData, nextStep } = useDayPowerStore();
  const [powerOptions, setPowerOptions] = useState<
    { value: string; label: string; abbreviation: string; unit: string }[]
  >([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isValidDate, setIsValidDate] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        `/daypowers/getpower/?powerId=${formData.powerId}`,
      );
      const fetched = response.data;

      updateFormData({
        upstreamLevel: Number(fetched.upstreamLevel),
        downstreamLevel: Number(fetched.downstreamLevel),
        totalStorageamount: Number(fetched.totalStorageamount),
        totalStorageaverage: Number(fetched.totalStorageaverage),
        activeStorageamount: Number(fetched.activeStorageamount),
        activeStorageaverage: Number(fetched.activeStorageaverage),
        turbineDischargeamount: Number(fetched.turbineDischargeamount),
        turbineDischargeaverage: Number(fetched.turbineDischargeaverage),
        spillwayDischargeamount: Number(fetched.spillwayDischargeamount),
        spillwayDischargeaverage: Number(fetched.spillwayDischargeaverage),
        ecologicalDischargeamount: Number(fetched.ecologicalDischargeamount),
        ecologicalDischargeaverage: Number(fetched.ecologicalDischargeaverage),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (formData.powerId) {
      fetchData();
    }
  }, [formData.powerId]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user: User = JSON.parse(userStr);
        const powers = user.powers || [];

        const options = powers.map((p) => ({
          value: p.power.id.toString(),
          label: `${p.power.name}`,
          abbreviation: p.power.abbreviation,
          unit: p.power.unit.toString(),
        }));

        setPowerOptions(options);
      } catch (error) {
        console.error("Invalid user format in localStorage");
      }
    }
  }, []);

  useEffect(() => {
    if (formData.unit) {
      const currentLength = formData.machinesAvailability?.length || 0;

      if (currentLength !== formData.unit) {
        const updatedMachines = Array.from(
          { length: formData.unit },
          (_, idx) => ({
            turbine: idx + 1,
            maxs: 0,
            mins: 0,
          }),
        );

        updateFormData({ machinesAvailability: updatedMachines });
      }
    }
  }, [formData.machinesAvailability?.length, formData.unit, updateFormData]);

  // 👉 Check powerId + powerDate with API
  useEffect(() => {
    const { powerId, powerDate } = formData;

    if (powerId && powerDate) {
      const formattedDate = moment(powerDate, "DD-MM-YYYY").format(
        "YYYY-MM-DD",
      );

      if (!moment(formattedDate, "YYYY-MM-DD", true).isValid()) {
        setIsValidDate(true); // enable next ถ้า date ไม่ถูก format
        return;
      }

      setIsChecking(true);
      axiosInstance
        .get(`/daypowers/checkpowerdate`, {
          params: { powerId, powerDate: formattedDate },
        })
        .then((res) => {
          const data = res.data;

          if (Array.isArray(data)) {
            setIsValidDate(data.length === 0);
          } else if (
            data &&
            typeof data === "object" &&
            Object.keys(data).length > 0
          ) {
            setIsValidDate(false);
          } else {
            setIsValidDate(true);
          }
        })
        .catch(() => {
          setIsValidDate(true); // enable next กรณี error
        })
        .finally(() => {
          setIsChecking(false);
        });
    } else {
      setIsValidDate(true); // enable next ถ้าไม่มีข้อมูล
    }
  }, [formData.powerId, formData.powerDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.powerId && formData.powerDate && isValidDate) {
      nextStep();
    } else {
      alert("ข้อมูลไม่ถูกต้อง หรือยังไม่ได้ตรวจสอบ");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="px-2">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          {/* Power Select */}
          <div>
            <Label>Select Powersource</Label>
            <div className="relative">
              <Select
                placeholder="Select Powersource"
                value={formData.powerId?.toString() || ""}
                options={powerOptions}
                onChange={(value) => {
                  const selected = powerOptions.find(
                    (opt) => opt.value === value,
                  );
                  updateFormData({
                    powerId: parseInt(value),
                    abbreviation: selected?.abbreviation || null,
                    unit: selected ? parseInt(selected.unit) : null,
                  });
                }}
                required
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <DatePicker
              id="date-picker"
              label="Date"
              placeholder="Select Date"
              defaultDate={formData.powerDate || ""}
              minDate={new Date()}
              onChange={(_, currentDateString) => {
                updateFormData({ powerDate: currentDateString });
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end px-2 py-2">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isValidDate || isChecking}
        >
          {isChecking ? "Checking..." : "Next"}
        </button>
      </div>
    </form>
  );
};
