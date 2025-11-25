import { create } from "zustand";
import { persist } from "zustand/middleware";

type FilterState = {
  selectedPowerId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  setSelectedPowerId: (id: string | null) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
};

export const useFilterStore = create(
  persist<FilterState>(
    (set) => ({
      selectedPowerId: null,
      startDate: new Date(),
      endDate: new Date(),
      setSelectedPowerId: (id) => set({ selectedPowerId: id }),
      setStartDate: (date) => set({ startDate: date }),
      setEndDate: (date) => set({ endDate: date }),
    }),
    { name: "dayreport-filter-page" },
  ),
);
