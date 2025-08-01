/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getLocalStorage, removeLocalStorage } from "@/utils/storage";
import Label from "@/components/form/Label";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";

type User = {
  id: number;
  roleId: number;
};

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldpassword: "",
    password1: "",
    password2: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Submit the form data
      await axiosInstance.put(`/users/changepassword/${user?.id}`, formData);

      removeLocalStorage("token");
      removeLocalStorage("user");
      removeLocalStorage("day-power-storage");
      removeLocalStorage("week-power-storage");
      removeLocalStorage("month-power-storage");
      removeLocalStorage("create-report-storage");

      // ลบ token จาก cookie
      document.cookie = "token=; path=/; max-age=0";

      toast.success("Change Password successfully");
      router.push("/");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-100">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
            <div>
              <Label>OldPassword</Label>
              <Input
                type="text"
                name="oldpassword"
                value={formData.oldpassword || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="text"
                name="password1"
                value={formData.password1 || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="text"
                name="password2"
                value={formData.password2 || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 xl:w-1/2 ${
                isSubmitting ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {isSubmitting ? "change Password..." : "change Password"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
