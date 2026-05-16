import { create } from "zustand";

import type { RouteStop } from "@/adapters";

interface StopsStore {
  selectedStop: RouteStop | null;
  setSelectedStop: (stop: RouteStop | null) => void;
}

export const useStopsStore = create<StopsStore>((set) => ({
  selectedStop: null,
  setSelectedStop: (stop) => set({ selectedStop: stop }),
}));
