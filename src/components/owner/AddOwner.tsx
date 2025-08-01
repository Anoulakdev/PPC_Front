// components/modals/AddModal.tsx
import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axiosInstance from "@/utils/axiosInstance";

interface AddOwnerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export default function AddOwner({ isOpen, onClose, onAdd }: AddOwnerProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/owners`, formData);

      // ✅ reset form
      setFormData({
        name: "",
        code: "",
      });

      // ✅ callback หากต้องการ refresh
      if (onAdd) onAdd();
      onClose();
    } catch (error) {
      console.error("Failed to add voltage", error);
      // Optional: แสดง toast, alert ฯลฯ
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add Owner
          </h4>
        </div>
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="custom-scrollbar overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Code</Label>
                <Input
                  type="text"
                  name="code"
                  value={formData.code || ""}
                  onChange={handleChange}
                />
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
