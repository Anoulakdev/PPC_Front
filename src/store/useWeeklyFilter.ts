import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentWeek } from "@/utils/weeksInYear";

type FilterState = {
  selectedPowerId: string | null;
  selectedYear: string;
  selectedWeek: string;
  setSelectedPowerId: (id: string | null) => void;
  setSelectedYear: (year: string) => void;
  setSelectedWeek: (week: string) => void;
};

export const useFilterStore = create(
  persist<FilterState>(
    (set) => ({
      selectedPowerId: null,
      selectedYear: new Date().getFullYear().toString(),
      selectedWeek: getCurrentWeek(),
      setSelectedPowerId: (id) => set({ selectedPowerId: id }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setSelectedWeek: (week) => set({ selectedWeek: week }),
    }),
    { name: "week-filter-page" },
  ),
);
