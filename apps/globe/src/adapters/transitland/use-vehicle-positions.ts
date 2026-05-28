import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { create } from "zustand";

import { mapApiClient } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";
import {
  transportProviderPath,
  type MapServerTransportProviderId,
} from "@/lib/transport-provider";
import type { VehicleType } from "@/lib/types";

import { toVehiclePositions, type MapServerVehicle } from "./transfer";

interface VehicleDiagnosticsState {
  message: string | null;
  autoSyncMessage: string | null;
  setMessage: (message: string | null) => void;
  setAutoSyncMessage: (message: string | null) => void;
}

export interface VehiclePosition {
  id: string;
  tripId: string | null;
  routeId: string;
  routeShortName: string;
  routeColor: string;
  operatorOnestopId?: string;
  vehicleType: VehicleType;
  longitude: number;
  latitude: number;
  bearing: number;
  label: string;
  licensePlate: string;
  lastUpdateTime: number;
  stale: boolean;
}

interface MapVehiclesResponse {
  vehicles: MapServerVehicle[];
  meta?: {
    message?: string;
    snapshot_available?: boolean;
    auto_sync?: {
      message?: string;
    };
  };
}

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

export const useVehicleDiagnosticsStore = create<VehicleDiagnosticsState>(
  (set) => ({
    message: null,
    autoSyncMessage: null,
    setMessage: (message) => set({ message }),
    setAutoSyncMessage: (autoSyncMessage) => set({ autoSyncMessage }),
  }),
);

export function useVehiclePositions(
  provider: MapServerTransportProviderId = "transitland",
  enabled = true,
) {
  const { bbox, zoom } = useTransitlandBBoxStore();
  const [debouncedBbox, setDebouncedBbox] = useState(bbox);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBbox(bbox);
    }, 500);
    return () => clearTimeout(timer);
  }, [bbox]);

  return useQuery<VehiclePosition[]>({
    queryKey: queryKey.mapServer.vehicles(provider, debouncedBbox),
    queryFn: async () => {
      if (!debouncedBbox) return [];
      const { data, error } = await mapApiClient<MapVehiclesResponse>(
        transportProviderPath(provider, "/vehicles"),
        {
          query: { bbox: debouncedBbox },
        },
      );
      if (error) return [];
      useVehicleDiagnosticsStore
        .getState()
        .setMessage(data.meta?.message ?? null);
      useVehicleDiagnosticsStore
        .getState()
        .setAutoSyncMessage(data.meta?.auto_sync?.message ?? null);
      return toVehiclePositions(data.vehicles);
    },
    enabled: enabled && !!debouncedBbox && zoom >= 8,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
}
