import { create } from "zustand";
import { persist } from "zustand/middleware";

type FilterState = {
  selectedPowerId: string | null;
  selectedYear: string;
  setSelectedPowerId: (id: string | null) => void;
  setSelectedYear: (year: string) => void;
};

export const useFilterStore = create(
  persist<FilterState>(
    (set) => ({
      selectedPowerId: null,
      selectedYear: new Date().getFullYear().toString(),
      setSelectedPowerId: (id) => set({ selectedPowerId: id }),
      setSelectedYear: (year) => set({ selectedYear: year }),
    }),
    { name: "year-filter-page" },
  ),
);
