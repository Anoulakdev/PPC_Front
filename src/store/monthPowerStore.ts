import { create } from "zustand";
import { persist } from "zustand/middleware";

type TurbineData = {
  turbine: number;
  hourly: number[];
};

type FormData = {
  powerId: number | null;
  sYear: string | null;
  sMonth: string | null;
  abbreviation: string | null;
  totalDate: number | null;
  turbineData: TurbineData[];
  totalPower: number | null;
  remark?: string | null;
  remarks?: string[] | null;
};

type MonthPowerState = {
  formData: FormData;
  currentStep: number;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
};

export const useMonthPowerStore = create<MonthPowerState>()(
  persist(
    (set) => ({
      formData: {
        powerId: null,
        sYear: null,
        sMonth: null,
        abbreviation: null,
        totalDate: null,
        turbineData: [],
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
            sYear: null,
            sMonth: null,
            abbreviation: null,
            totalDate: null,
            turbineData: [],
            totalPower: null,
            remark: null,
            remarks: [],
          },
          currentStep: 1,
        }),
    }),
    {
      name: "month-power-storage",
    },
  ),
);
