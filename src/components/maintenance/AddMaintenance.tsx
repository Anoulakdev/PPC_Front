// components/modals/AddModal.tsx
import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { ChevronDownIcon, TimeIcon } from "@/icons";
import FileInput from "../form/input/FileInput";
import axiosInstance from "@/utils/axiosInstance";
import { getLocalStorage } from "@/utils/storage";
import DatePickerOne from "../form/date-pickerone";
import TextArea from "../form/input/TextArea";
import moment from "moment";

interface AddEventProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

type Power = {
  id: number;
  name: string;
};

type User = {
  roleId: number;
  powers: { power: Power }[];
};

export default function AddEvent({ isOpen, onClose, onAdd }: AddEventProps) {
  const [formData, setFormData] = useState({
    powerId: "",
    maintenanceName: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    detail: "",
    remark: "",
  });

  const [user, setUser] = useState<User | null>(null);
  const [powerList, setPowerList] = useState<Power[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    setUser(storedUser as User);
  }, []);

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
          const powers = user.powers.map((p) => p.power);
          setPowerList(powers);
        } catch (error) {
          console.error("Invalid user format in localStorage", error);
        }
      }
    };

    fetchPowerList();
  }, [user]);

  const powerOptions = powerList.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = new FormData();
      data.append("powerId", formData.powerId);
      data.append("maintenanceName", formData.maintenanceName);
      data.append(
        "startDate",
        moment(formData.startDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
      );
      data.append(
        "endDate",
        moment(formData.endDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
      );
      data.append(
        "startTime",
        moment(formData.startTime, "HH:mm").format("HH:mm"),
      );
      data.append("endTime", moment(formData.endTime, "HH:mm").format("HH:mm"));
      data.append("detail", formData.detail);
      data.append("remark", formData.remark);

      if (uploadedFile) data.append("maintenanceFile", uploadedFile);
      await axiosInstance.post(`/maintenances`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ reset form
      setFormData({
        powerId: "",
        maintenanceName: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        detail: "",
        remark: "",
      });

      setUploadedFile(null);
      onAdd();
      onClose();
    } catch (error) {
      console.error("Failed to add Event", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="relative w-full rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add Maintenance
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
            <div className="grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-1">
              <div>
                <Label>Choose Power Source</Label>
                <div className="relative">
                  <Select
                    options={powerOptions}
                    value={formData.powerId}
                    placeholder="Select All Power"
                    onChange={(val) =>
                      setFormData((p) => ({ ...p, powerId: val }))
                    }
                    className="dark:bg-dark-900"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-4">
              <div>
                <DatePickerOne
                  id="startDate"
                  label="Start Date"
                  placeholder="Select Date"
                  defaultDate={formData.startDate}
                  onChange={(date, formatted) =>
                    setFormData((prev) => ({ ...prev, startDate: formatted }))
                  }
                />
              </div>
              <div>
                <DatePickerOne
                  id="endDate"
                  label="End Date"
                  placeholder="Select Date"
                  defaultDate={formData.endDate}
                  onChange={(date, formatted) =>
                    setFormData((prev) => ({ ...prev, endDate: formatted }))
                  }
                />
              </div>
              <div>
                <Label>Start Time</Label>
                <div className="relative">
                  <Input
                    type="time"
                    name="startTime"
                    value={formData.startTime || ""}
                    onChange={handleChange}
                    step={60}
                    lang="en-GB"
                    className="pr-10"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <TimeIcon />
                  </span>
                </div>
              </div>
              <div>
                <Label>End Time</Label>
                <div className="relative">
                  <Input
                    type="time"
                    name="endTime"
                    value={formData.endTime || ""}
                    onChange={handleChange}
                    step={60}
                    lang="en-GB"
                    className="pr-10"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <TimeIcon />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Maintenance</Label>
                <TextArea
                  name="maintenanceName"
                  id="maintenanceName"
                  rows={2}
                  value={formData.maintenanceName || ""}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, maintenanceName: value }))
                  }
                  required
                />
              </div>

              <div>
                <Label>Detail</Label>
                <TextArea
                  name="detail"
                  id="detail"
                  rows={2}
                  value={formData.detail || ""}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, detail: value }))
                  }
                />
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-1">
              <div>
                <Label>Remark</Label>
                <TextArea
                  name="remark"
                  id="remark"
                  rows={2}
                  value={formData.remark || ""}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, remark: value }))
                  }
                />
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-1">
              <div>
                <Label>Upload File (PDF)</Label>
                <FileInput
                  accept="application/pdf"
                  name="maintenanceFile"
                  onChange={handleFileChange}
                  className="custom-class"
                />
                {uploadedFile && (
                  <div className="mt-2 h-55 rounded border p-2">
                    <iframe
                      src={URL.createObjectURL(uploadedFile)}
                      title="PDF Preview"
                      width="100%"
                      height="100%"
                    />
                  </div>
                )}
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
