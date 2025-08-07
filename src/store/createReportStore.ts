import { create } from "zustand";
import { persist } from "zustand/middleware";

type TurbineData = {
  turbine: number;
  hourly: number[];
};

type FormData = {
  powerId: number | null;
  powerDate: string | null;
  totalPower: number | null;
  totalUnit?: number | null;
  turbineData: TurbineData[];
  remarks?: string[] | null;
  activeStorageamount: number | null;
  activeStorageaverage: number | null;
  waterLevel: number | null;
  dwy: number | null;
  dwf: number | null;
  dwm: number | null;
  pws: number | null;
  inflowamount: number | null;
  inflowaverage: number | null;
  tdAmount: number | null;
  tdAverage: number | null;
  spillwayamount: number | null;
  spillwayaverage: number | null;
  owramount: number | null;
  owraverage: number | null;
  rainFall: number | null;
  netEnergyOutput: number | null;
  waterRate: number | null;
  totalOutflow: number | null;
  averageOutflow: number | null;
};

type CreateReportState = {
  formData: FormData;
  currentStep: number;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
};

export const useCreateReportStore = create<CreateReportState>()(
  persist(
    (set) => ({
      formData: {
        powerId: null,
        powerDate: null,
        totalPower: null,
        totalUnit: null,
        turbineData: [],
        remarks: [],
        activeStorageamount: null,
        activeStorageaverage: null,
        waterLevel: null,
        dwy: null,
        dwf: null,
        dwm: null,
        pws: null,
        inflowamount: null,
        inflowaverage: null,
        tdAmount: null,
        tdAverage: null,
        spillwayamount: null,
        spillwayaverage: null,
        owramount: null,
        owraverage: null,
        rainFall: null,
        netEnergyOutput: null,
        waterRate: null,
        totalOutflow: null,
        averageOutflow: null,
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
            totalPower: null,
            totalUnit: null,
            turbineData: [],
            remarks: [],
            activeStorageamount: null,
            activeStorageaverage: null,
            waterLevel: null,
            dwy: null,
            dwf: null,
            dwm: null,
            pws: null,
            inflowamount: null,
            inflowaverage: null,
            tdAmount: null,
            tdAverage: null,
            spillwayamount: null,
            spillwayaverage: null,
            owramount: null,
            owraverage: null,
            rainFall: null,
            netEnergyOutput: null,
            waterRate: null,
            totalOutflow: null,
            averageOutflow: null,
          },
          currentStep: 1,
        }),
    }),
    {
      name: "create-report-storage",
    },
  ),
);
