/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { ChevronDownIcon } from "../../icons";
import moment from "moment";
import { getLocalStorage } from "@/utils/storage";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Image from "next/image";

type Company = {
  id: number;
  name: string;
};

type Voltage = {
  id: number;
  name: string;
};

type Fuel = {
  id: number;
  name: string;
};

type Contract = {
  id: number;
  name: string;
};

type Branch = {
  id: number;
  name: string;
  province: string;
};

type Region = {
  id: number;
  name: string;
};

type Owner = {
  id: number;
  name: string;
};

type Power = {
  id: number;
  name: string;
  company: {
    name: string;
  };
};

type DataPower = {
  id: number;
  company: Company;
  name: string;
  unit: number;
  abbreviation: string;
  address: string;
  phone: string;
  voltage: Voltage;
  fuel: Fuel;
  contract: Contract;
  branch: Branch;
  region: Region;
  owner: Owner;
  latitude: string;
  longitude: string;
  installCapacity: string;
  baseEnergy: string;
  fullLevel: string;
  deadLevel: string;
  totalStorageFull: string;
  totalStorageDead: string;
  totalActiveFull: string;
  totalActiveDead: string;
  codDate: string;
  powerimg: string;
};

type User = {
  roleId: number;
  powers: { power: Power }[];
};

export default function DayTable() {
  const [data, setData] = useState<DataPower | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  //   const router = useRouter();

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedPowerId]);

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
    if (!selectedPowerId) {
      setData(null); // ถ้ายังไม่เลือก → ล้างข้อมูล
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/powers/${selectedPowerId}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(null);
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
          <div className="w-full md:w-1/2">
            <Label>Choose Power Source</Label>
            <div className="relative">
              <Select
                options={powerOptions}
                value={selectedPowerId ?? ""}
                placeholder="Select Power"
                onChange={handleSelectChange}
                className="dark:bg-dark-900"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex h-48 items-center justify-center">
            <div className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        )}

        {!loading && data && (
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white via-white to-gray-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30">
            {/* Decorative gradient overlay */}
            <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />

            {/* Header Section */}
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
                {/* Image with gradient border */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-40" />
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white shadow-lg dark:border-gray-800">
                    <Image
                      width={96}
                      height={96}
                      src={
                        data.powerimg
                          ? `${process.env.NEXT_PUBLIC_API_URL}/upload/power/${data.powerimg}`
                          : "/nophoto.jpg"
                      }
                      alt="power"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Title Section */}
                <div className="flex-1 text-center xl:text-left">
                  <h4 className="mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:to-gray-300">
                    {data.name}
                  </h4>

                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {data.company?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {/* Company */}
              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-blue-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Company
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data.company?.name}
                  </p>
                </div>
              </div>

              {/* Power Plant Name */}
              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-purple-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Power Plant
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.name}
                  </p>
                </div>
              </div>

              {/* Unit */}
              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-green-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Unit
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.unit}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-indigo-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Abbreviation
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.abbreviation}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-amber-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Address
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.address}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-red-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.phone}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    COD Date
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {moment(data?.codDate).format("DD-MM-YYYY")}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-blue-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Voltage
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.voltage?.name}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-orange-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Install Capacity (MW)
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {Number(data?.installCapacity).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-green-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Base Energy (GWh)
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {Number(data?.baseEnergy).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gray-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Latitude
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.latitude}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-pink-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Longitude
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.longitude}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-lime-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Contract
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.contract?.name}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-teal-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Branch
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.branch?.name}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-red-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Region
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.region?.name}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-violet-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Fuel Type
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.fuel?.name}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Owner
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.owner?.name}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-pink-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Full Level (masl)
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {Number(data?.fullLevel).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-indigo-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Total Storage at Full Level (m³)
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {Number(data?.totalStorageFull).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-amber-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Total Active at Full Level (m³)
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {Number(data?.totalActiveFull).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-red-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Dead Level (masl)
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {Number(data?.deadLevel).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-blue-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Total Storage at Dead Level (m³)
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {Number(data?.totalStorageDead).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="group/item relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-violet-500/5 transition-transform duration-300 group-hover/item:scale-150" />
                <div className="relative">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                    Total Active at Dead Level (m³)
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {Number(data?.totalActiveDead).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
