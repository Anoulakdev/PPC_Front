import { create } from "zustand";
import { persist } from "zustand/middleware";

type FilterState = {
  selectedPowerId: string | null;
  selectedYear: string;
  selectedMonth: string;
  setSelectedPowerId: (id: string | null) => void;
  setSelectedYear: (year: string) => void;
  setSelectedMonth: (month: string) => void;
};

export const useFilterStore = create(
  persist<FilterState>(
    (set) => ({
      selectedPowerId: null,
      selectedYear: new Date().getFullYear().toString(),
      selectedMonth: (new Date().getMonth() + 1).toString().padStart(2, "0"),
      setSelectedPowerId: (id) => set({ selectedPowerId: id }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
    }),
    { name: "month-filter-page" },
  ),
);
