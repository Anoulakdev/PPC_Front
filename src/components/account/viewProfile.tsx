"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getLocalStorage } from "@/utils/storage";
import Image from "next/image";

type UserData = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roleId: number;
  phone: string;
  isActive: string;
  isOnline: boolean;
  userimg: string;
  company: Company;
  role: Role;
  powers: {
    power?: Power;
  }[];
};

type Role = {
  id: number;
  name: string;
};

type Power = {
  id: number;
  name: string;
};

type Company = {
  id: number;
  name: string;
};

type User = {
  id: number;
  roleId: number;
};

export default function ViewProfile() {
  const [data, setData] = useState<UserData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    if (!storedUser) {
      toast.error("Unauthorized access.");
      router.push("/");
      return;
    }
    setUser(storedUser as User);
  }, [router]);

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id);
    }
  }, [user?.id]);

  const fetchUserData = async (id: number) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data.");
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={
                  data?.userimg
                    ? `${process.env.NEXT_PUBLIC_API_URL}/upload/user/${data.userimg}`
                    : "/nophoto.jpg"
                }
                alt="user"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 xl:text-left dark:text-white/90">
                {data?.firstname} {data?.lastname}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data?.email}
                </p>
                {/* <div className="hidden h-3.5 w-px bg-gray-300 xl:block dark:bg-gray-700"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data?.role?.name}
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-xl font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
                  First Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {data?.firstname}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
                  Last Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {data?.lastname}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
                  Email address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {data?.email}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {data?.phone}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
                  Company
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {data?.company?.name}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm leading-normal text-gray-500 dark:text-gray-400">
                  Power
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {data?.powers
                    ?.filter((p) => p.power?.name)
                    ?.sort((a, b) =>
                      (a.power!.name || "").localeCompare(b.power!.name || ""),
                    )
                    ?.map((p) => p.power!.name)
                    ?.join(", ") || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
