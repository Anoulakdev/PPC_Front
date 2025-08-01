// components/modals/AddModal.tsx
import { useState, useEffect } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import Select from "../../form/Select";
import { ChevronDownIcon } from "@/icons";
import FileInput from "../../form/input/FileInput";
import MultiSelect from "../../form/MultiSelect";
import axiosInstance from "@/utils/axiosInstance";

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

type Company = {
  id: number;
  name: string;
};

type Power = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  name: string;
};

export default function AddUser({ isOpen, onClose, onAdd }: AddUserProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    roleId: "",
    phone: "",
    userimg: "",
    companyId: "",
  });
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role[]>([]);
  const [company, setCompany] = useState<Company[]>([]);
  const [power, setPower] = useState<Power[]>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchRole = async () => {
      try {
        const response = await axiosInstance.get(`/roles/selectrole`);
        setRole(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchRole();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCompany = async () => {
      try {
        const response = await axiosInstance.get(`/companys/selectcompany`);
        setCompany(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompany();
  }, [isOpen]);

  useEffect(() => {
    if (!formData.companyId) return;
    const fetchPower = async () => {
      try {
        const response = await axiosInstance.get(
          `/powers/selectpower?companyId=${formData.companyId}`,
        );
        setPower(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchPower();
  }, [formData.companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, companyId: value }));
    setSelectedPowers([]);
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, roleId: value }));
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
    selected: false,
  }));

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = new FormData();
      data.append("email", formData.email);
      data.append("firstname", formData.firstname);
      data.append("lastname", formData.lastname);
      data.append("roleId", formData.roleId);
      data.append("phone", formData.phone);
      data.append("companyId", formData.companyId);

      selectedPowers.forEach((id) => {
        data.append("powerIds[]", id);
      });

      if (uploadedImage) data.append("userimg", uploadedImage);

      await axiosInstance.post(`/users`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ reset form
      setFormData({
        email: "",
        firstname: "",
        lastname: "",
        roleId: "",
        phone: "",
        userimg: "",
        companyId: "",
      });

      setSelectedPowers([]);
      setUploadedImage(null);
      onAdd();
      onClose();
    } catch (error) {
      console.error("Failed to add company", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="relative w-full rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add User
          </h4>
        </div>
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
                  value={formData.email || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Firstname</Label>
                <Input
                  type="text"
                  name="firstname"
                  value={formData.firstname || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Lastname</Label>
                <Input
                  type="text"
                  name="lastname"
                  value={formData.lastname || ""}
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
                    value={formData.roleId.toString()}
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
                  value={formData.phone || ""}
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
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Label>Company</Label>
                <div className="relative">
                  <Select
                    options={companyOptions}
                    value={formData.companyId.toString()}
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
              close
            </Button>
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? "Add Data..." : "Add Data"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
