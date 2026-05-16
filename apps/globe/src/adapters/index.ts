import { create } from "zustand";

import { useRouteShapes as useBKKRouteShapes } from "./bkk/use-route-shapes";
import {
  useVehiclePositions as useBKKVehiclePositions,
  type VehiclePosition,
} from "./bkk/use-vehicle-positions";
import { useRouteShapes as useTransitlandRouteShapes } from "./transitland/use-route-shapes";
import {
  useRouteStops as useTransitlandRouteStops,
  type RouteStop,
} from "./transitland/use-route-stops";
import {
  useStopDepartures as useTransitlandStopDepartures,
  type StopDeparture,
} from "./transitland/use-stop-departures";
import {
  useTransitlandBBoxStore as useAdapterBBoxStore,
  useVehiclePositions as useTransitlandVehiclePositions,
} from "./transitland/use-vehicle-positions";

export { useAdapterBBoxStore };

export type { RouteStop, StopDeparture, VehiclePosition };

export type SourceAdapterId = "bkk" | "transitland";

interface AdapterStore {
  activeAdapter: SourceAdapterId;
  setActiveAdapter: (id: SourceAdapterId) => void;
}

export const useAdapterStore = create<AdapterStore>((set) => ({
  activeAdapter: "transitland",
  setActiveAdapter: (id) => set({ activeAdapter: id }),
}));

export function useActiveVehiclePositions() {
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);

  const bkk = useBKKVehiclePositions();
  const transitland = useTransitlandVehiclePositions();

  return activeAdapter === "bkk" ? bkk : transitland;
}

export function useActiveRouteShapes(
  routeId: string | null,
  operatorOnestopId?: string,
) {
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);

  const bkk = useBKKRouteShapes(routeId);
  const transitland = useTransitlandRouteShapes(routeId, operatorOnestopId);

  return activeAdapter === "bkk" ? bkk : transitland;
}

export function useActiveRouteStops(
  routeId: string | null,
  operatorOnestopId?: string,
) {
  return useTransitlandRouteStops(routeId, operatorOnestopId);
}

export function useActiveStopDepartures(stopKey: string | null) {
  // Only Transitland supports departures for now
  return useTransitlandStopDepartures(stopKey);
}
