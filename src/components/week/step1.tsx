/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { useWeekPowerStore } from "@/store/weekPowerStore";
import axiosInstance from "@/utils/axiosInstance";
import { getCurrentWeek, getWeeksInYear } from "@/utils/weeksInYear";

type Power = {
  id: number;
  name: string;
  abbreviation: string;
};

type User = {
  powers: { power: Power }[];
};

export const Step1 = () => {
  const { formData, updateFormData, nextStep } = useWeekPowerStore();
  const [powerOptions, setPowerOptions] = useState<
    { value: string; label: string; abbreviation: string }[]
  >([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isValidDate, setIsValidDate] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentWeek = getCurrentWeek();

    if (!formData.sYear || !formData.sWeek) {
      updateFormData({
        sYear: currentYear,
        sWeek: currentWeek,
        totalDate: 7,
      });
    }
  }, []);

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
        }));

        setPowerOptions(options);
      } catch {
        console.error("Invalid user format in localStorage");
      }
    }
  }, []);

  useEffect(() => {
    const { powerId, sYear, sWeek } = formData;

    if (powerId && sYear && sWeek) {
      setIsChecking(true);
      axiosInstance
        .get(`/weekpowers/checkpowerweek`, {
          params: { powerId, sYear, sWeek },
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
  }, [formData.powerId, formData.sYear, formData.sWeek]);

  const weekOptions = (() => {
    const yearStr = formData.sYear || new Date().getFullYear().toString();
    const year = parseInt(yearStr, 10);
    const totalWeeks = getWeeksInYear(year);
    return Array.from({ length: totalWeeks }, (_, i) => {
      const w = (i + 1).toString().padStart(2, "0");
      return { value: w, label: w };
    });
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.powerId && isValidDate) {
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
                  });
                }}
                required
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          <div>
            <Label>Choose Week</Label>
            <div className="relative">
              <Select
                options={weekOptions}
                value={formData.sWeek || ""}
                placeholder="Select All Week"
                onChange={(value) => updateFormData({ sWeek: value })}
                className="dark:bg-dark-900"
                required
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
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
