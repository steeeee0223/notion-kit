import { useQuery } from "@tanstack/react-query";

import { queryKey } from "@/lib/query-key";
import type { VehicleType } from "@/lib/types";

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

export function useVehiclePositions() {
  return useQuery<VehiclePosition[]>({
    queryKey: queryKey.bkk.vehicles(),
    // Query starts empty. It will be populated by WebSocket directly setting query data.
    queryFn: () => [],
    staleTime: Infinity,
    refetchInterval: false,
  });
}
