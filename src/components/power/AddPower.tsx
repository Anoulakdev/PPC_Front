// components/modals/AddModal.tsx
import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { ChevronDownIcon } from "@/icons";
import FileInput from "../form/input/FileInput";
import axiosInstance from "@/utils/axiosInstance";
import DatePickerOne from "@/components/form/date-pickerone";
import moment from "moment";

interface AddPowerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
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

export default function AddPower({ isOpen, onClose, onAdd }: AddPowerProps) {
  const [formData, setFormData] = useState({
    companyId: "",
    name: "",
    unit: "",
    abbreviation: "",
    address: "",
    phone: "",
    powerimg: "",
    voltageId: "",
    fuelId: "",
    contractId: "",
    branchId: "",
    regionId: "",
    ownerId: "",
    latitude: "",
    longitude: "",
    installCapacity: "",
    baseEnergy: "",
    fullLevel: "",
    deadLevel: "",
    totalStorageFull: "",
    totalStorageDead: "",
    totalActiveFull: "",
    totalActiveDead: "",
    codDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company[]>([]);
  const [voltage, setVoltage] = useState<Voltage[]>([]);
  const [fuel, setFuel] = useState<Fuel[]>([]);
  const [contract, setContract] = useState<Contract[]>([]);
  const [branch, setBranch] = useState<Branch[]>([]);
  const [region, setRegion] = useState<Region[]>([]);
  const [owner, setOwner] = useState<Owner[]>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAllData = async () => {
      try {
        const [
          companyRes,
          voltageRes,
          fuelRes,
          contractRes,
          branchRes,
          regionRes,
          ownerRes,
        ] = await Promise.all([
          axiosInstance.get(`/companys/selectcompany`),
          axiosInstance.get(`/voltages/selectvoltage`),
          axiosInstance.get(`/fueltypes/selectfuel`),
          axiosInstance.get(`/contracts/selectcontract`),
          axiosInstance.get(`/branchs/selectbranch`),
          axiosInstance.get(`/regions/selectregion`),
          axiosInstance.get(`/owners/selectowner`),
        ]);

        setCompany(companyRes.data);
        setVoltage(voltageRes.data);
        setFuel(fuelRes.data);
        setContract(contractRes.data);
        setBranch(branchRes.data);
        setRegion(regionRes.data);
        setOwner(ownerRes.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchAllData();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (["latitude", "longitude"].includes(name)) {
      if (!/^-?\d*\.?\d{0,6}$/.test(value)) return;
    }

    if (["installCapacity", "baseEnergy"].includes(name)) {
      if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const companyOptions = company.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const voltageOptions = voltage.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const fuelOptions = fuel.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const contractOptions = contract.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const branchOptions = branch.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const regionOptions = region.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const ownerOptions = owner.map(({ id, name }) => ({
    value: id.toString(),
    label: name,
  }));

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedImage(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = new FormData();
      data.append("companyId", formData.companyId);
      data.append("name", formData.name);
      data.append("unit", formData.unit);
      data.append("abbreviation", formData.abbreviation);
      data.append("address", formData.address);
      data.append("phone", formData.phone);
      data.append("voltageId", formData.voltageId);
      data.append("fuelId", formData.fuelId);
      data.append("contractId", formData.contractId);
      data.append("branchId", formData.branchId);
      data.append("regionId", formData.regionId);
      data.append("ownerId", formData.ownerId);
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      data.append("installCapacity", formData.installCapacity);
      data.append("baseEnergy", formData.baseEnergy);
      data.append("fullLevel", formData.fullLevel);
      data.append("deadLevel", formData.deadLevel);
      data.append("totalStorageFull", formData.totalStorageFull);
      data.append("totalStorageDead", formData.totalStorageDead);
      data.append("totalActiveFull", formData.totalActiveFull);
      data.append("totalActiveDead", formData.totalActiveDead);
      data.append(
        "codDate",
        moment(formData.codDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
      );

      if (uploadedImage) data.append("powerimg", uploadedImage); // แนบไฟล์

      console.log(data);

      await axiosInstance.post(`/powers`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ reset form
      setFormData({
        companyId: "",
        name: "",
        unit: "",
        abbreviation: "",
        address: "",
        phone: "",
        powerimg: "",
        voltageId: "",
        fuelId: "",
        contractId: "",
        branchId: "",
        regionId: "",
        ownerId: "",
        latitude: "",
        longitude: "",
        installCapacity: "",
        baseEnergy: "",
        fullLevel: "",
        deadLevel: "",
        totalStorageFull: "",
        totalStorageDead: "",
        totalActiveFull: "",
        totalActiveDead: "",
        codDate: "",
      });

      setUploadedImage(null);

      // ✅ callback หากต้องการ refresh
      if (onAdd) onAdd();
      onClose();
    } catch (error) {
      console.error("Failed to add power", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add Power
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
            <div className="grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-4">
              <div>
                <Label>Company</Label>
                <div className="relative">
                  <Select
                    options={companyOptions}
                    onChange={(value) => handleSelectChange("companyId", value)}
                    value={formData.companyId.toString()}
                    placeholder="Select Company"
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
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Unit</Label>
                <Input
                  type="number"
                  name="unit"
                  value={formData.unit || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Abbreviation</Label>
                <Input
                  type="text"
                  name="abbreviation"
                  value={formData.abbreviation || ""}
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
                  value={formData.address || ""}
                  onChange={handleChange}
                />
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
                <DatePickerOne
                  id="codDate"
                  label="COD Date"
                  placeholder="Select Date"
                  defaultDate={formData.codDate}
                  onChange={(date, formatted) =>
                    setFormData((prev) => ({ ...prev, codDate: formatted }))
                  }
                />
              </div>
              <div>
                <Label>Voltage</Label>
                <div className="relative">
                  <Select
                    options={voltageOptions}
                    onChange={(value) => handleSelectChange("voltageId", value)}
                    value={formData.voltageId.toString()}
                    placeholder="Select Voltage"
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
                  value={formData.installCapacity || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Base Energy (GWh)</Label>
                <Input
                  type="text"
                  name="baseEnergy"
                  value={formData.baseEnergy || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Latitude</Label>
                <Input
                  type="text"
                  name="latitude"
                  value={formData.latitude || ""}
                  onChange={handleChange}
                  placeholder="0.000000"
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="text"
                  name="longitude"
                  value={formData.longitude || ""}
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
                    value={formData.contractId.toString()}
                    placeholder="Select Contract"
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
                    onChange={(value) => handleSelectChange("branchId", value)}
                    value={formData.branchId.toString()}
                    placeholder="Select Branch"
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
                    onChange={(value) => handleSelectChange("regionId", value)}
                    value={formData.regionId.toString()}
                    placeholder="Select Region"
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
                    value={formData.fuelId.toString()}
                    placeholder="Select Fuel Type"
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
                    value={formData.ownerId.toString()}
                    placeholder="Select Owner"
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
                  value={formData.fullLevel || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Total Storage at Full Level (MCM)</Label>
                <Input
                  type="text"
                  name="totalStorageFull"
                  value={formData.totalStorageFull || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Total Active at Full Level (MCM)</Label>
                <Input
                  type="text"
                  name="totalActiveFull"
                  value={formData.totalActiveFull || ""}
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
                  value={formData.deadLevel || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Total Storage at Dead Level (MCM)</Label>
                <Input
                  type="text"
                  name="totalStorageDead"
                  value={formData.totalStorageDead || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Total Active at Dead Level (MCM)</Label>
                <Input
                  type="text"
                  name="totalActiveDead"
                  value={formData.totalActiveDead || ""}
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
