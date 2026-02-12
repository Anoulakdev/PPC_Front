import { create } from "zustand";
import { persist } from "zustand/middleware";

type MachineAvailability = {
  turbine: number;
  maxs: number;
  mins: number;
};

type TurbineData = {
  turbine: number;
  hourly: number[];
};

type FormData = {
  powerId: number | null;
  powerDate: string | null;
  abbreviation: string | null;
  unit?: number | null;
  fuelId?: number | null;
  machinesAvailability: MachineAvailability[];
  turbineData: TurbineData[];
  upstreamLevel: string | number | null;
  downstreamLevel: string | number | null;
  totalStorageamount: string | number | null;
  totalStorageaverage: string | number | null;
  activeStorageamount: string | number | null;
  activeStorageaverage: string | number | null;
  turbineDischargeamount: string | number | null;
  turbineDischargeaverage: string | number | null;
  spillwayDischargeamount: string | number | null;
  spillwayDischargeaverage: string | number | null;
  ecologicalDischargeamount: string | number | null;
  ecologicalDischargeaverage: string | number | null;
  totalDischargeamount: string | number | null;
  totalDischargeaverage: string | number | null;
  totalPower: number | null;
  remark?: string | null;
  remarks?: string[] | null;
};

type DayPowerState = {
  formData: FormData;
  currentStep: number;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
};

export const useDayPowerStore = create<DayPowerState>()(
  persist(
    (set) => ({
      formData: {
        powerId: null,
        powerDate: null,
        abbreviation: null,
        unit: null,
        machinesAvailability: [],
        turbineData: [],
        upstreamLevel: null,
        downstreamLevel: null,
        totalStorageamount: null,
        totalStorageaverage: null,
        activeStorageamount: null,
        activeStorageaverage: null,
        turbineDischargeamount: null,
        turbineDischargeaverage: null,
        spillwayDischargeamount: null,
        spillwayDischargeaverage: null,
        ecologicalDischargeamount: null,
        ecologicalDischargeaverage: null,
        totalDischargeamount: null,
        totalDischargeaverage: null,
        totalPower: null,
        remark: null,
        remarks: [],
      },
      currentStep: 1,
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
      resetForm: () =>
        set({
          formData: {
            powerId: null,
            powerDate: null,
            abbreviation: null,
            unit: null,
            machinesAvailability: [],
            turbineData: [],
            upstreamLevel: null,
            downstreamLevel: null,
            totalStorageamount: null,
            totalStorageaverage: null,
            activeStorageamount: null,
            activeStorageaverage: null,
            turbineDischargeamount: null,
            turbineDischargeaverage: null,
            spillwayDischargeamount: null,
            spillwayDischargeaverage: null,
            ecologicalDischargeamount: null,
            ecologicalDischargeaverage: null,
            totalDischargeamount: null,
            totalDischargeaverage: null,
            totalPower: null,
            remark: null,
            remarks: [],
          },
          currentStep: 1,
        }),
    }),
    {
      name: "day-power-storage",
    },
  ),
);
