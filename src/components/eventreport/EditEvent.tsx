"use client";

import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import FileInput from "../form/input/FileInput";
import { ChevronDownIcon, TimeIcon } from "@/icons";
import axiosInstance from "@/utils/axiosInstance";
import { getLocalStorage } from "@/utils/storage";
import moment from "moment";
import DatePickerEdit from "../form/date-pickeredit";
import TextArea from "../form/input/TextArea";

interface EditEventProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  id: number | null;
}

type Event = {
  id: number;
  powerId: string;
  eventName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  rootCause: string;
  preventive: string;
  remark: string;
  eventFile: string;
  power: Power;
};

type Power = {
  id: number;
  name: string;
  company: {
    name: string;
  };
};

type User = {
  roleId: number;
  powers: { power: Power }[];
};

export default function EditEvent({
  isOpen,
  onClose,
  onUpdate,
  id,
}: EditEventProps) {
  const [data, setData] = useState<Event | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [power, setPower] = useState<Power[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = getLocalStorage("user");
    if (storedUser) setUser(storedUser as User);
  }, []);

  useEffect(() => {
    if (isOpen && id != null) {
      axiosInstance
        .get(`/events/${id}`)
        .then((response) => {
          const eventData = response.data as Event;
          setData(eventData);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [id, isOpen, user]);

  useEffect(() => {
    if (isOpen && user) {
      if (user.roleId === 3 || user.roleId === 4) {
        axiosInstance
          .get(`/powers/selectpower`)
          .then((res) => setPower(res.data))
          .catch((err) => console.error("Fetch powers error:", err));
      } else if (user.roleId === 5 || user.roleId === 6) {
        const powers = user.powers.map((p) => p.power);
        setPower(powers);
      }
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handlePowerChange = (value: string) => {
    setData((prev) => (prev ? { ...prev, powerId: value } : null));
  };

  const powerOptions = power.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const handleSubmit = async () => {
    if (!data) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("powerId", data.powerId);
      formData.append("eventName", data.eventName || "");
      formData.append("startDate", data.startDate);
      formData.append("endDate", data.endDate);
      formData.append(
        "startTime",
        moment(data.startTime, "HH:mm").format("HH:mm"),
      );
      formData.append("endTime", moment(data.endTime, "HH:mm").format("HH:mm"));
      formData.append("rootCause", data.rootCause || "");
      formData.append("preventive", data.preventive || "");
      formData.append("remark", data.remark || "");

      if (uploadedFile) formData.append("eventFile", uploadedFile);

      await axiosInstance.put(`/events/${id}`, formData, {
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
          Edit Event
        </h4>

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
                    value={data.powerId}
                    onChange={handlePowerChange}
                    placeholder="Select Power"
                    className="dark:bg-dark-900"
                    required
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-4">
              <div>
                <DatePickerEdit
                  id="startDate"
                  name="startDate"
                  label="Start Date"
                  placeholder="Select Date"
                  defaultDate={data.startDate}
                  onChange={(dates) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            startDate: moment(dates[0], "DD-MM-YYYY").format(
                              "YYYY-MM-DD",
                            ),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div>
                <DatePickerEdit
                  id="endDate"
                  name="endDate"
                  label="End Date"
                  placeholder="Select Date"
                  defaultDate={data.endDate}
                  onChange={(dates) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            endDate: moment(dates[0], "DD-MM-YYYY").format(
                              "YYYY-MM-DD",
                            ),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div>
                <Label>Start Time</Label>
                <div className="relative">
                  <Input
                    type="time"
                    name="startTime"
                    value={data.startTime || ""}
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
                    value={data.endTime || ""}
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
                <Label>Events</Label>
                <TextArea
                  name="eventName"
                  id="eventName"
                  rows={2}
                  value={data.eventName || ""}
                  onChange={(value) =>
                    setData((prev) =>
                      prev ? { ...prev, eventName: value } : null,
                    )
                  }
                  required
                />
              </div>

              <div>
                <Label>Root Cause</Label>
                <TextArea
                  name="rootCause"
                  id="rootCause"
                  rows={2}
                  value={data.rootCause || ""}
                  onChange={(value) =>
                    setData((prev) =>
                      prev ? { ...prev, rootCause: value } : null,
                    )
                  }
                />
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Preventive</Label>
                <TextArea
                  name="preventive"
                  id="preventive"
                  rows={2}
                  value={data.preventive || ""}
                  onChange={(value) =>
                    setData((prev) =>
                      prev ? { ...prev, preventive: value } : null,
                    )
                  }
                />
              </div>

              <div>
                <Label>Remark</Label>
                <TextArea
                  name="remark"
                  id="remark"
                  rows={2}
                  value={data.remark || ""}
                  onChange={(value) =>
                    setData((prev) =>
                      prev ? { ...prev, remark: value } : null,
                    )
                  }
                />
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-5 lg:grid-cols-1">
              <div>
                <Label>Upload File (PDF)</Label>
                <FileInput
                  accept="application/pdf"
                  name="eventFile"
                  onChange={handleFileChange}
                  className="custom-class"
                />
                {(uploadedFile || data.eventFile) && (
                  <div className="mt-2 h-55 rounded border p-2">
                    <iframe
                      src={
                        uploadedFile
                          ? URL.createObjectURL(uploadedFile)
                          : `${process.env.NEXT_PUBLIC_API_URL}/upload/event/${data.eventFile}`
                      }
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
