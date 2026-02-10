/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import FileInput from "../form/input/FileInput";
import { ChevronDownIcon } from "@/icons";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";
import DatePickerEdit from "../form/date-pickeredit";
import moment from "moment";

interface EditPowerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  id: number | null;
}

type Company = {
  id: number;
  name: string;
};

type Voltage = {
  id: number;
  name: string;
};

type Fuel = {
  id: number;
  name: string;
};

type Contract = {
  id: number;
  name: string;
};

type Branch = {
  id: number;
  name: string;
};

type Region = {
  id: number;
  name: string;
};

type Owner = {
  id: number;
  name: string;
};

type Power = {
  id: number;
  name: string;
  unit: number;
  abbreviation: string;
  address: string;
  phone: string;
  companyId: number;
  powerimg: string;
  voltageId: number;
  fuelId: number;
  contractId: number;
  branchId: number;
  regionId: number;
  ownerId: number;
  latitude: number;
  longitude: number;
  installCapacity: string;
  baseEnergy: string;
  fullLevel: string;
  deadLevel: string;
  totalStorageFull: string;
  totalStorageDead: string;
  totalActiveFull: string;
  totalActiveDead: string;
  codDate: string;
};

// **ปรับปรุง: เพิ่ม cache สำหรับ dropdown data**
let dropdownCache: {
  company: Company[];
  voltage: Voltage[];
  fuel: Fuel[];
  contract: Contract[];
  branch: Branch[];
  region: Region[];
  owner: Owner[];
} | null = null;

let dropdownPromise: Promise<any> | null = null;

export default function EditPower({
  isOpen,
  onClose,
  onUpdate,
  id,
}: EditPowerProps) {
  const [data, setData] = useState<Power | null>(null);
  const [company, setCompany] = useState<Company[]>([]);
  const [voltage, setVoltage] = useState<Voltage[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [contract, setContract] = useState<Contract[]>([]);
  const [branch, setBranch] = useState<Branch[]>([]);
  const [region, setRegion] = useState<Region[]>([]);
  const [owner, setOwner] = useState<Owner[]>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // **ปรับปรุง: ใช้ useCallback เพื่อป้องกันการ re-fetch ซ้ำ**
  const fetchDropdownData = useCallback(async () => {
    // ถ้ามี cache อยู่แล้ว ใช้จาก cache
    if (dropdownCache) {
      setCompany(dropdownCache.company);
      setVoltage(dropdownCache.voltage);
      setFuel(dropdownCache.fuel);
      setContract(dropdownCache.contract);
      setBranch(dropdownCache.branch);
      setRegion(dropdownCache.region);
      setOwner(dropdownCache.owner);
      return;
    }

    // ถ้ากำลัง fetch อยู่ รอให้ fetch เสร็จ
    if (dropdownPromise) {
      await dropdownPromise;
      return;
    }

    setDropdownLoading(true);

    try {
      // สร้าง promise และเก็บไว้
      dropdownPromise = Promise.all([
        axiosInstance.get(`/companys/selectcompany`),
        axiosInstance.get(`/voltages/selectvoltage`),
        axiosInstance.get(`/fueltypes/selectfuel`),
        axiosInstance.get(`/contracts/selectcontract`),
        axiosInstance.get(`/branchs/selectbranch`),
        axiosInstance.get(`/regions/selectregion`),
        axiosInstance.get(`/owners/selectowner`),
      ]);

      const [
        companyRes,
        voltageRes,
        fuelRes,
        contractRes,
        branchRes,
        regionRes,
        ownerRes,
      ] = await dropdownPromise;

      // เก็บไว้ใน cache
      dropdownCache = {
        company: companyRes.data,
        voltage: voltageRes.data,
        fuel: fuelRes.data,
        contract: contractRes.data,
        branch: branchRes.data,
        region: regionRes.data,
        owner: ownerRes.data,
      };

      setCompany(companyRes.data);
      setVoltage(voltageRes.data);
      setFuel(fuelRes.data);
      setContract(contractRes.data);
      setBranch(branchRes.data);
      setRegion(regionRes.data);
      setOwner(ownerRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      // **ปรับปรุง: แจ้งเตือนผู้ใช้เมื่อโหลดไม่สำเร็จ**
      alert("ไม่สามารถโหลดข้อมูล dropdown ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDropdownLoading(false);
      dropdownPromise = null;
    }
  }, []);

  // **ปรับปรุง: โหลด dropdown data ทันทีเมื่อ component mount**
  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  // **ปรับปรุง: แยก effect สำหรับโหลดข้อมูล power**
  useEffect(() => {
    if (isOpen && id != null) {
      setLoading(true);
      axiosInstance
        .get(`/powers/${id}`)
        .then((res) => setData(res.data))
        .catch((err) => {
          console.error("Fetch power error:", err);
          alert("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectChange = useCallback((name: string, value: string) => {
    setData((prev) => (prev ? { ...prev, [name]: Number(value) } : null));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setUploadedImage(selectedFile);
  };

  const handleSubmit = async () => {
    if (!data) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("unit", data.unit.toString());
      formData.append("abbreviation", data.abbreviation || "");
      formData.append("address", data.address || "");
      formData.append("phone", data.phone || "");
      formData.append("companyId", data.companyId.toString());
      formData.append("voltageId", data.voltageId.toString());
      formData.append("fuelId", data.fuelId.toString());
      formData.append("contractId", data.contractId.toString());
      formData.append("branchId", data.branchId.toString());
      formData.append("regionId", data.regionId.toString());
      formData.append("ownerId", data.ownerId.toString());
      formData.append("latitude", data.latitude.toString());
      formData.append("longitude", data.longitude.toString());
      formData.append("installCapacity", data.installCapacity);
      formData.append("baseEnergy", data.baseEnergy);
      formData.append("fullLevel", data.fullLevel);
      formData.append("deadLevel", data.deadLevel);
      formData.append("totalStorageFull", data.totalStorageFull);
      formData.append("totalStorageDead", data.totalStorageDead);
      formData.append("totalActiveFull", data.totalActiveFull);
      formData.append("totalActiveDead", data.totalActiveDead);
      formData.append("codDate", data.codDate);
      if (uploadedImage) formData.append("powerimg", uploadedImage);

      await axiosInstance.put(`/powers/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // **ปรับปรุง: ใช้ useMemo เพื่อ optimize การสร้าง options**
  const companyOptions = useMemo(
    () => company.map((c) => ({ value: c.id.toString(), label: c.name })),
    [company],
  );

  const voltageOptions = useMemo(
    () => voltage.map((c) => ({ value: c.id.toString(), label: c.name })),
    [voltage],
  );

  const fuelOptions = useMemo(
    () => fuel.map((c) => ({ value: c.id.toString(), label: c.name })),
    [fuel],
  );

  const contractOptions = useMemo(
    () => contract.map((c) => ({ value: c.id.toString(), label: c.name })),
    [contract],
  );

  const branchOptions = useMemo(
    () => branch.map((c) => ({ value: c.id.toString(), label: c.name })),
    [branch],
  );

  const regionOptions = useMemo(
    () => region.map((c) => ({ value: c.id.toString(), label: c.name })),
    [region],
  );

  const ownerOptions = useMemo(
    () => owner.map((c) => ({ value: c.id.toString(), label: c.name })),
    [owner],
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar w-full rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit Power
        </h4>

        {/* **ปรับปรุง: แสดง loading indicator** */}
        {(loading || dropdownLoading || !data) && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {dropdownLoading ? "กำลังโหลดข้อมูล..." : "กำลังโหลด..."}
              </p>
            </div>
          </div>
        )}

        {!loading && !dropdownLoading && data && (
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="px-2">
              <div className="grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-4">
                <div>
                  <Label>Company</Label>
                  <div className="relative">
                    <Select
                      options={companyOptions}
                      onChange={(value) =>
                        handleSelectChange("companyId", value)
                      }
                      placeholder="Select Company"
                      value={data.companyId?.toString()}
                      className="dark:bg-dark-900"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

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
                  <Label>Unit</Label>
                  <Input
                    type="number"
                    name="unit"
                    value={data.unit || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Abbreviation</Label>
                  <Input
                    type="text"
                    name="abbreviation"
                    value={data.abbreviation || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-4">
                <div>
                  <Label>Address</Label>
                  <Input
                    type="text"
                    name="address"
                    value={data.address || ""}
                    onChange={handleChange}
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
                <div>
                  <DatePickerEdit
                    id="codDate"
                    name="codDate"
                    label="COD Date"
                    placeholder="Select Date"
                    defaultDate={data.codDate || ""}
                    onChange={(dates) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              codDate: moment(dates[0], "DD-MM-YYYY").format(
                                "YYYY-MM-DD",
                              ),
                            }
                          : null,
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Voltage</Label>
                  <div className="relative">
                    <Select
                      options={voltageOptions}
                      onChange={(value) =>
                        handleSelectChange("voltageId", value)
                      }
                      placeholder="Select Voltage"
                      value={data.voltageId?.toString()}
                      className="dark:bg-dark-900"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-4">
                <div>
                  <Label>Install Capacity (MW)</Label>
                  <Input
                    type="text"
                    name="installCapacity"
                    value={data.installCapacity || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Base Energy (GWh)</Label>
                  <Input
                    type="text"
                    name="baseEnergy"
                    value={data.baseEnergy || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="text"
                    name="latitude"
                    value={data.latitude || ""}
                    onChange={handleChange}
                    placeholder="0.000000"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="text"
                    name="longitude"
                    value={data.longitude || ""}
                    onChange={handleChange}
                    placeholder="0.000000"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-4">
                <div>
                  <Label>Contract</Label>
                  <div className="relative">
                    <Select
                      options={contractOptions}
                      onChange={(value) =>
                        handleSelectChange("contractId", value)
                      }
                      placeholder="Select Contract"
                      value={data.contractId?.toString()}
                      className="dark:bg-dark-900"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Branch</Label>
                  <div className="relative">
                    <Select
                      options={branchOptions}
                      onChange={(value) =>
                        handleSelectChange("branchId", value)
                      }
                      placeholder="Select Branch"
                      value={data.branchId?.toString()}
                      className="dark:bg-dark-900"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Region</Label>
                  <div className="relative">
                    <Select
                      options={regionOptions}
                      onChange={(value) =>
                        handleSelectChange("regionId", value)
                      }
                      placeholder="Select Region"
                      value={data.regionId?.toString()}
                      className="dark:bg-dark-900"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Fuel Type</Label>
                  <div className="relative">
                    <Select
                      options={fuelOptions}
                      onChange={(value) => handleSelectChange("fuelId", value)}
                      placeholder="Select Fuel Type"
                      value={data.fuelId?.toString()}
                      className="dark:bg-dark-900"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-4">
                <div>
                  <Label>Owner</Label>
                  <div className="relative">
                    <Select
                      options={ownerOptions}
                      onChange={(value) => handleSelectChange("ownerId", value)}
                      placeholder="Select Owner"
                      value={data.ownerId?.toString()}
                      className="dark:bg-dark-900"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Full Level (masl)</Label>
                  <Input
                    type="text"
                    name="fullLevel"
                    value={data.fullLevel || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Total Storage at Full Level (m³)</Label>
                  <Input
                    type="text"
                    name="totalStorageFull"
                    value={data.totalStorageFull || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Total Active at Full Level (m³)</Label>
                  <Input
                    type="text"
                    name="totalActiveFull"
                    value={data.totalActiveFull || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-4">
                <div>
                  <Label>Dead Level (masl)</Label>
                  <Input
                    type="text"
                    name="deadLevel"
                    value={data.deadLevel || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Total Storage at Dead Level (m³)</Label>
                  <Input
                    type="text"
                    name="totalStorageDead"
                    value={data.totalStorageDead || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Total Active at Dead Level (m³)</Label>
                  <Input
                    type="text"
                    name="totalActiveDead"
                    value={data.totalActiveDead || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Upload Image</Label>
                  <FileInput
                    accept="image/*"
                    name="powerimg"
                    onChange={handleFileChange}
                  />
                  {data.powerimg && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/upload/power/${data.powerimg}`}
                      alt="Current Power"
                      width={150}
                      height={150}
                      className="mt-2 rounded border"
                    />
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
        )}
      </div>
    </Modal>
  );
}
