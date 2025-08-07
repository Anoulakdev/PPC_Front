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
import { ChevronDownIcon } from "../../icons";
import moment from "moment";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePickerAll from "@/components/form/date-pickerall";
import { getLocalStorage } from "@/utils/storage";
import axiosInstance from "@/utils/axiosInstance";

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

type TotalChartRawData = {
  originalHourlySum: number[];
  currentHourlySum: number[];
};

export default function TotalChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedPowerId, startDate, endDate]);

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

      const formatDate = (date: Date) => moment(date).format("YYYY-MM-DD");
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      const url = selectedPowerId
        ? `/daypowers/totalchart/?powerId=${selectedPowerId}&startDate=${start}&endDate=${end}`
        : `/daypowers/totalchart/?startDate=${start}&endDate=${end}`;

      const response = await axiosInstance.get(url);
      const rawData: TotalChartRawData = response.data;

      // สร้าง labels: 01:00 ถึง 00:00
      const labels = Array.from(
        { length: 24 },
        (_, i) => `${((i + 1) % 24).toString().padStart(2, "0")}:00`,
      );

      // สร้าง chartData สำหรับ chart.js
      const formattedData = {
        labels,
        datasets: [
          {
            label: "Declaration",
            data: rawData.originalHourlySum,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.4,
          },
          {
            label: "Dispatch",
            data: rawData.currentHourlySum,
            borderColor: "rgb(255, 99, 132)",
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
              id="start-date"
              label="Start Date"
              defaultDate={startDate ?? undefined}
              onChange={(dates) => {
                const selected = dates?.[0] ?? null;
                setStartDate(selected);
              }}
            />
          </div>

          <div className="w-full md:w-1/5">
            <DatePickerAll
              id="end-date"
              label="End Date"
              defaultDate={endDate ?? undefined}
              onChange={(dates) => {
                const selected = dates?.[0] ?? null;
                setEndDate(selected);
              }}
            />
          </div>
        </div>
        <hr />

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : chartData ? (
          <div className="mx-auto mt-5 md:h-[450px] h-[300px] w-full sm:h-screen">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false, // ให้ chart ยืดตาม container
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
