"use client";

import { useEffect, useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import FileInput from "../../form/input/FileInput";
import axiosInstance from "@/utils/axiosInstance";

interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  id: number | null;
}

type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roleId: number;
  phone: string;
  isActive: string;
  isOnline: boolean;
  userimg: string;
  companyId: number;
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

export default function EditUser({
  isOpen,
  onClose,
  onUpdate,
  id,
}: EditUserProps) {
  const [data, setData] = useState<User | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && id != null) {
      axiosInstance
        .get<User>(`/users/${id}`)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.error("Fetch user error:", err));
    }
  }, [id, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedImage(file);
  };

  const handleSubmit = async () => {
    if (!data) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("firstname", data.firstname);
      formData.append("lastname", data.lastname || "");
      formData.append("phone", data.phone || "");
      formData.append("roleId", String(data.roleId || 2));

      if (uploadedImage) formData.append("userimg", uploadedImage);

      await axiosInstance.put(`/users/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="relative w-full rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit User
        </h4>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
              <div>
                <Label>Firstname</Label>
                <Input
                  type="text"
                  name="firstname"
                  value={data.firstname || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Lastname</Label>
                <Input
                  type="text"
                  name="lastname"
                  value={data.lastname || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="text"
                  name="phone"
                  value={data.phone || ""}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
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
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
