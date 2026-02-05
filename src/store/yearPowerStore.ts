import { create } from "zustand";
import { persist } from "zustand/middleware";

type TurbineData = {
  thead: string;
  unit: string;
  tbody: (number | null)[];
};

type FormData = {
  powerId: number | null;
  sYear: string | null;
  abbreviation: string | null;
  turbineData: TurbineData[];
};

type YearPowerState = {
  formData: FormData;
  currentStep: number;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
};

export const useYearPowerStore = create<YearPowerState>()(
  persist(
    (set) => ({
      formData: {
        powerId: null,
        sYear: null,
        abbreviation: null,
        turbineData: [],
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
            abbreviation: null,
            turbineData: [],
          },
          currentStep: 1,
        }),
    }),
    {
      name: "year-power-storage",
    },
  ),
);
