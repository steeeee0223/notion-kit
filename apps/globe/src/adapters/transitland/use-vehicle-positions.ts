import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { create } from "zustand";

import type { VehicleType } from "@/lib/types";

export interface VehiclePosition {
  id: string;
  routeId: string;
  routeShortName: string;
  routeColor: string;
  vehicleType: VehicleType;
  longitude: number;
  latitude: number;
  bearing: number;
  label: string;
  licensePlate: string;
  lastUpdateTime: number;
  stale: boolean;
}

const API_BASE = "http://localhost:3100";

interface BBoxStore {
  bbox: string;
  zoom: number;
  flyTo: [number, number] | null;
  setBBoxAndZoom: (bbox: string, zoom: number) => void;
  requestFlyTo: (center: [number, number]) => void;
  clearFlyTo: () => void;
}

export const useTransitlandBBoxStore = create<BBoxStore>((set) => ({
  bbox: "",
  zoom: 0,
  flyTo: null,
  setBBoxAndZoom: (bbox, zoom) => set({ bbox, zoom }),
  requestFlyTo: (center) => set({ flyTo: center }),
  clearFlyTo: () => set({ flyTo: null }),
}));

export function useVehiclePositions() {
  const { bbox, zoom } = useTransitlandBBoxStore();
  const [debouncedBbox, setDebouncedBbox] = useState(bbox);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBbox(bbox);
    }, 500);
    return () => clearTimeout(timer);
  }, [bbox]);

  return useQuery<VehiclePosition[]>({
    queryKey: ["transitland", "vehicles", debouncedBbox],
    queryFn: async () => {
      if (!debouncedBbox) return [];
      const url = new URL(`${API_BASE}/api/transit/transitland/vehicles`);
      url.searchParams.set("bbox", debouncedBbox);
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      const data = await res.json() as { vehicles: VehiclePosition[] };
      return data.vehicles;
    },
    enabled: !!debouncedBbox && zoom >= 8,
    staleTime: 5000,
    refetchInterval: 10000,
    placeholderData: keepPreviousData,
  });
}
