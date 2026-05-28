import { create } from "zustand";

import type { VehiclePosition } from "@/adapters";

interface VehicleStore {
  selectedVehicle: VehiclePosition | null;
  setSelectedVehicle: (v: VehiclePosition | null) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  selectedVehicle: null,
  setSelectedVehicle: (v) => set({ selectedVehicle: v }),
}));
