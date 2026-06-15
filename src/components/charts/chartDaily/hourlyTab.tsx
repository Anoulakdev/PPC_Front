/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { ChevronDownIcon } from "../../../icons";
import moment from "moment";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePickerAll from "@/components/form/date-pickerall";
import { getLocalStorage } from "@/utils/storage";
import axiosInstance from "@/utils/axiosInstance";

ChartJS.register(
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Filler,
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

type TotalChartRawData = {
  originalHourlySum: number[];
  currentHourlySum: number[];
};

export default function TotalChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [powerDate, setPowerDate] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const getFormattedChartData = () => {
    if (!chartData) return null;

    return {
      ...chartData,
      datasets: chartData.datasets.map((dataset: any, index: number) => {
        const isDeclaration = index === 0;
        const color = isDeclaration ? "rgb(255, 99, 132)" : "rgb(75, 192, 192)";
        const barBgColor = isDeclaration
          ? "rgba(255, 99, 132, 0.85)"
          : "rgba(75, 192, 192, 0.85)";

        if (chartType === "bar") {
          return {
            ...dataset,
            type: "bar",
            fill: false,
            backgroundColor: barBgColor,
            borderColor: color,
            borderWidth: 1.5,
          };
        } else {
          // line
          return {
            ...dataset,
            type: "line",
            fill: false,
            borderColor: color,
            borderWidth: 2,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 2,
            tension: 0.4,
          };
        }
      }),
    };
  };

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedPowerId, powerDate]);

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

      const formattedDate = moment(powerDate).format("YYYY-MM-DD");

      const url = selectedPowerId
        ? `/daypowers/totalchartdate/?powerId=${selectedPowerId}&powerDate=${formattedDate}`
        : `/daypowers/totalchartdate/?powerDate=${formattedDate}`;

      const response = await axiosInstance.get(url);
      const rawData: TotalChartRawData = response.data;

      // สร้าง labels: 01:00 ถึง 00:00
      const labels = Array.from({ length: 24 }, (_, i) => {
        const start = i.toString().padStart(2, "0");
        const end = ((i + 1) % 24).toString().padStart(2, "0");
        return `${start} - ${end}`;
      });

      // สร้าง chartData สำหรับ chart.js
      const formattedData = {
        labels,
        datasets: [
          {
            label: "Declaration",
            data: rawData.originalHourlySum,
            borderColor: "rgb(255, 99, 132)",
            tension: 0.4,
          },
          {
            label: "Dispatch",
            data: rawData.currentHourlySum,
            borderColor: "rgb(75, 192, 192)",
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
            <DatePickerAll
              id="powerDate"
              label="Select Date"
              defaultDate={powerDate ?? undefined}
              onChange={(dates) => {
                const selected = dates?.[0] ?? null;
                setPowerDate(selected);
              }}
            />
          </div>

          <div className="w-full md:w-auto md:ml-auto">
            <Label>Chart Type</Label>
            <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800 w-fit">
              <button
                type="button"
                onClick={() => setChartType("line")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  chartType === "line"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Line
              </button>
              <button
                type="button"
                onClick={() => setChartType("bar")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  chartType === "bar"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Bar
              </button>
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
            {chartType === "bar" ? (
              <Bar
                key="bar"
                data={getFormattedChartData() as any}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 65,
                      },
                    },
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            ) : (
              <Line
                key="line"
                data={getFormattedChartData() as any}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 65,
                      },
                    },
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            )}
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
