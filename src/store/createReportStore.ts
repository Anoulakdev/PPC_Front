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
  fuelId?: number | null;
  turbineData: TurbineData[];
  remarks?: string[] | null;
  activeStorageamount: string | number | null;
  activeStorageaverage: number | null;
  waterLevel: string | number | null;
  dwy: number | null;
  dwf: number | null;
  dwm: number | null;
  pws: number | null;
  inflowamount: string | number | null;
  inflowaverage: string | number | null;
  tdAmount: string | number | null;
  tdAverage: string | number | null;
  spillwayamount: string | number | null;
  spillwayaverage: string | number | null;
  owramount: string | number | null;
  owraverage: string | number | null;
  rainFall: string | number | null;
  powerGeneration: string | number | null;
  netEnergyImport: string | number | null;
  netEnergyOutput: string | number | null;
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
        powerGeneration: null,
        netEnergyImport: null,
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
            powerGeneration: null,
            netEnergyOutput: null,
            netEnergyImport: null,
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
