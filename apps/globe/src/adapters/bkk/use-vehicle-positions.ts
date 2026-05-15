import { useQuery } from "@tanstack/react-query";

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

export function useVehiclePositions() {
  return useQuery<VehiclePosition[]>({
    queryKey: ["transit", "vehicles"],
    // Query starts empty. It will be populated by WebSocket directly setting query data.
    queryFn: () => [],
    staleTime: Infinity,
    refetchInterval: false,
  });
}
