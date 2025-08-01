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
import FileInput from "../form/input/FileInput";

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
};

type User = {
  id: number;
  roleId: number;
};

export default function EditProfile() {
  const [data, setData] = useState<UserData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("firstname", data.firstname);
      formData.append("lastname", data.lastname || "");
      formData.append("phone", data.phone || "");
      if (uploadedImage) formData.append("userimg", uploadedImage);

      await axiosInstance.put(`/users/updateprofile/${data.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      removeLocalStorage("token");
      removeLocalStorage("user");
      removeLocalStorage("day-power-storage");
      removeLocalStorage("week-power-storage");
      removeLocalStorage("month-power-storage");
      removeLocalStorage("create-report-storage");
      toast.success("Profile Updated Successfully");

      // ลบ token จาก cookie
      document.cookie = "token=; path=/; max-age=0";

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
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={data?.email || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Firstname</Label>
              <Input
                type="text"
                name="firstname"
                value={data?.firstname || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Lastname</Label>
              <Input
                type="text"
                name="lastname"
                value={data?.lastname || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
            <div>
              <Label>Phone</Label>
              <Input
                type="text"
                name="phone"
                value={data?.phone || ""}
                onChange={handleChange}
                maxLength={10}
              />
            </div>

            <div>
              <Label>Upload Image</Label>
              <FileInput
                accept="image/*"
                name="userimg"
                onChange={handleFileChange}
                className="custom-class"
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
              {isSubmitting ? "Update Profile..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
