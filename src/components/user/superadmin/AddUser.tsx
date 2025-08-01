// components/modals/AddModal.tsx
import { useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import axiosInstance from "@/utils/axiosInstance";
import FileInput from "../../form/input/FileInput";

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export default function AddUser({ isOpen, onClose, onAdd }: AddUserProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    roleId: "2",
    phone: "",
    userimg: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedImage(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = new FormData();
      data.append("email", formData.email);
      data.append("firstname", formData.firstname);
      data.append("lastname", formData.lastname);
      data.append("roleId", formData.roleId);
      data.append("phone", formData.phone);

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
        roleId: "2",
        phone: "",
        userimg: "",
      });

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
              <div className="lg:col-span-1">
                <Label>Phone</Label>
                <Input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>

              <div className="lg:col-span-2">
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
