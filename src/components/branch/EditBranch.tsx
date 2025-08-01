"use client";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axiosInstance from "@/utils/axiosInstance";

interface EditBranchProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  id: number | null;
}

type Branch = {
  id: number;
  name: string;
  province: string;
};

export default function EditBranch({
  isOpen,
  onClose,
  onUpdate,
  id,
}: EditBranchProps) {
  const [data, setData] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && id != null) {
      axiosInstance
        .get(`/branchs/${id}`)
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [id, isOpen]);

  if (!isOpen || !data) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!data) return;

    try {
      setLoading(true);
      await axiosInstance.put(`/branchs/${id}`, {
        name: data.name,
        province: data.province,
      });

      onUpdate(); // รีโหลด data ที่หน้าหลัก
      onClose(); // ปิด modal
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Branch
          </h4>
        </div>

        <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={data.name || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Province</Label>
                <Input
                  type="text"
                  name="province"
                  value={data.province || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              close
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={loading}>
              {loading ? "update..." : "update"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
