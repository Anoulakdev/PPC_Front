/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { ChevronDownIcon } from "../../../icons";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { getLocalStorage } from "@/utils/storage";
import axiosInstance from "@/utils/axiosInstance";
import { getCurrentWeek, getWeeksInYear } from "@/utils/weeksInYear";
import SelectDate from "@/components/form/SelectDate";
import { getYearOptions } from "@/utils/yearOptions";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

type User = {
  roleId: number;
  powers: { power: Power }[];
};

type Power = {
  id: number;
  name: string;
  company: {
    name: string;
  };
};

export default function TotalChart() {
  const now = new Date();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(
    now.getFullYear().toString(),
  );
  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeek());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedPowerId, selectedYear, selectedWeek]);

  useEffect(() => {
    const fetchPowerList = async () => {
      if (!user) return;

      if (user.roleId === 3 || user.roleId === 4) {
        try {
          const response = await axiosInstance.get(`/powers/selectpower`);
          setPowerList(response.data);
        } catch (error) {
          console.error("Error fetching power list:", error);
        }
      } else if (user.roleId === 5 || user.roleId === 6) {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const localUser: User = JSON.parse(userStr);
            const powers = localUser.powers.map((p) => p.power);
            setPowerList(powers);
          }
        } catch (error) {
          console.error("Invalid user format in localStorage", error);
        }
      }
    };

    fetchPowerList();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const url = selectedPowerId
        ? `/weekpowers/totalchartweek/?powerId=${selectedPowerId}&sYear=${selectedYear}&sWeek=${selectedWeek}`
        : `/weekpowers/totalchartweek/?sYear=${selectedYear}&sWeek=${selectedWeek}`;

      const response = await axiosInstance.get(url);
      // response.data ตามโครงสร้างใหม่
      const data: {
        dates: string[];
        totalPowerOriginal: number[];
        totalPowerCurrent: number[];
      } = response.data;

      const labels = data.dates;
      const originalData = data.totalPowerOriginal;
      const currentData = data.totalPowerCurrent;

      const formattedData = {
        labels,
        datasets: [
          {
            label: "Declaration",
            data: originalData,
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 2,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 2,
            tension: 0.4,
          },
          {
            label: "Dispatch",
            data: currentData,
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 2,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 2,
            tension: 0.4,
          },
        ],
      };

      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (value: string) => {
    setSelectedPowerId(value);
  };

  const powerOptions = powerList.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const yearOptions = getYearOptions();

  const weekOptions = (() => {
    const year = parseInt(selectedYear, 10);
    const totalWeeks = getWeeksInYear(year);
    return Array.from({ length: totalWeeks }, (_, i) => {
      const w = (i + 1).toString().padStart(2, "0");
      return { value: w, label: w };
    });
  })();

  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
        <div className="mb-3 flex flex-col items-center gap-3 md:flex-row">
          <div className="w-full md:w-1/3">
            <Label>Choose Power Source</Label>
            <div className="relative">
              <Select
                options={powerOptions}
                value={selectedPowerId ?? ""}
                placeholder="Select All Power"
                onChange={handleSelectChange}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          <div className="w-full md:w-1/5">
            <Label>Choose Year</Label>
            <div className="relative">
              <SelectDate
                options={yearOptions}
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          <div className="w-full md:w-1/5">
            <Label>Choose Week</Label>
            <div className="relative">
              <Select
                options={weekOptions}
                value={selectedWeek}
                placeholder="Select All Week"
                onChange={(value) => setSelectedWeek(value)}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </div>
        <hr />

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : chartData ? (
          <div className="mx-auto mt-5 h-[300px] w-full sm:h-screen md:h-[400px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 45, // หมุน label ได้สูงสุด 45 องศา
                      minRotation: 65, // หมุน label อย่างน้อย 30 องศา
                    },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No data available.
          </div>
        )}
      </div>
    </>
  );
}
