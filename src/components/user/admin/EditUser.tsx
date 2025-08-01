"use client";

import { useEffect, useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import Select from "../../form/Select";
import FileInput from "../../form/input/FileInput";
import MultiSelect from "../../form/MultiSelect";
import { ChevronDownIcon } from "@/icons";
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
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [role, setRole] = useState<Role[]>([]);
  const [company, setCompany] = useState<Company[]>([]);
  const [power, setPower] = useState<Power[]>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && id != null) {
      axiosInstance
        .get<User>(`/users/${id}`)
        .then((res) => {
          setData(res.data);
          const powerIds = res.data.powers
            .map((p) => p.power?.id?.toString())
            .filter(Boolean) as string[];
          setSelectedPowers(powerIds);
        })
        .catch((err) => console.error("Fetch user error:", err));
    }
  }, [id, isOpen]);

  useEffect(() => {
    if (isOpen) {
      axiosInstance
        .get(`/roles/selectrole`)
        .then((res) => setRole(res.data))
        .catch((err) => console.error("Fetch roles error:", err));

      axiosInstance
        .get(`/companys/selectcompany`)
        .then((res) => setCompany(res.data))
        .catch((err) => console.error("Fetch companies error:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (data?.companyId) {
      axiosInstance
        .get(`/powers/selectpower?companyId=${data.companyId}`)
        .then((res) => setPower(res.data))
        .catch((err) => console.error("Fetch powers error:", err));
    }
  }, [data?.companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleCompanyChange = (value: string) => {
    const companyId = parseInt(value);
    setData((prev) => (prev ? { ...prev, companyId } : null));
    setSelectedPowers([]);
  };

  const handleRoleChange = (value: string) => {
    const roleId = parseInt(value);
    setData((prev) => (prev ? { ...prev, roleId } : null));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedImage(file);
  };

  const roleOptions = role
    .filter(({ id }) => ![1, 2].includes(id))
    .map(({ id, name }) => ({ value: id.toString(), label: name }));

  const companyOptions = company.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const powerOptions = power.map(({ id, name }) => ({
    value: id.toString(),
    text: name,
    selected: selectedPowers.includes(id.toString()),
  }));

  const handleSubmit = async () => {
    if (!data) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("firstname", data.firstname);
      formData.append("lastname", data.lastname || "");
      formData.append("roleId", data.roleId.toString());
      formData.append("phone", data.phone || "");
      formData.append("companyId", data.companyId.toString());

      selectedPowers.forEach((id) => {
        formData.append("powerIds[]", id);
      });

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
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={data.email || ""}
                  onChange={handleChange}
                  required
                />
              </div>

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
            </div>

            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
              <div>
                <Label>Role</Label>
                <div className="relative">
                  <Select
                    options={roleOptions}
                    value={data.roleId?.toString()}
                    onChange={handleRoleChange}
                    placeholder="Select Role"
                    className="dark:bg-dark-900"
                    required
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
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

            <div className="mt-3 grid grid-cols-1 gap-x-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Label>Company</Label>
                <div className="relative">
                  <Select
                    options={companyOptions}
                    value={data.companyId?.toString()}
                    onChange={handleCompanyChange}
                    placeholder="Select Company"
                    className="dark:bg-dark-900"
                    required
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
              <div className="relative lg:col-span-2">
                <MultiSelect
                  label="Select Powers"
                  options={powerOptions}
                  defaultSelected={selectedPowers}
                  onChange={(values) => setSelectedPowers(values)}
                />
                <p className="sr-only">
                  Selected Powers: {selectedPowers.join(", ")}
                </p>
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
