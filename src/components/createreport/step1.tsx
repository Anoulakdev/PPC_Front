/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import DatePicker from "@/components/form/date-picker";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { useCreateReportStore } from "@/store/createReportStore";
import axiosInstance from "@/utils/axiosInstance";
import moment from "moment";

type Power = {
  id: number;
  name: string;
  totalUnit: number;
};

type User = {
  powers: { power: Power }[];
};

export const Step1 = () => {
  const { formData, updateFormData, nextStep } = useCreateReportStore();
  const [powerOptions, setPowerOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isValidDate, setIsValidDate] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user: User = JSON.parse(userStr);
        const powers = user.powers || [];

        const options = powers.map((p) => ({
          value: p.power.id.toString(),
          label: `${p.power.name}`,
        }));

        setPowerOptions(options);
      } catch (error) {
        console.error("Invalid user format in localStorage");
      }
    }
  }, []);

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
        .get(`/dayreports/checkpowerdate`, {
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
                    totalUnit: 1,
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
