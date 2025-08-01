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
  machinesAvailability: MachineAvailability[];
  turbineData: TurbineData[];
  upstreamLevel: number | null;
  downstreamLevel: number | null;
  totalStorageamount: number | null;
  totalStorageaverage: number | null;
  activeStorageamount: number | null;
  activeStorageaverage: number | null;
  turbineDischargeamount: number | null;
  turbineDischargeaverage: number | null;
  spillwayDischargeamount: number | null;
  spillwayDischargeaverage: number | null;
  ecologicalDischargeamount: number | null;
  ecologicalDischargeaverage: number | null;
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
