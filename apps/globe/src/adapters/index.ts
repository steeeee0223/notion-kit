import { create } from "zustand";

import { useRouteShapes as useBKKRouteShapes } from "./bkk/use-route-shapes";
import { useVehiclePositions as useBKKVehiclePositions } from "./bkk/use-vehicle-positions";
import { useRouteShapes as useTransitlandRouteShapes } from "./transitland/use-route-shapes";
import {
  useRouteStops as useTransitlandRouteStops,
  type RouteStop,
} from "./transitland/use-route-stops";
import {
  useRouteTrips as useTransitlandRouteTrips,
  type RouteTrip,
} from "./transitland/use-route-trips";
import {
  useStopDepartures as useTransitlandStopDepartures,
  type StopDeparture,
} from "./transitland/use-stop-departures";
import {
  useTransitlandBBoxStore as useAdapterBBoxStore,
  useVehiclePositions as useTransitlandVehiclePositions,
  type VehiclePosition,
} from "./transitland/use-vehicle-positions";

export { useAdapterBBoxStore };

export type { RouteStop, RouteTrip, StopDeparture, VehiclePosition };

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
  const transitland = useTransitlandVehiclePositions(
    activeAdapter === "transitland",
  );

  return activeAdapter === "bkk" ? bkk : transitland;
}

export interface SelectedTripContext {
  tripId?: string | null;
  routeId?: string | null;
  routeColor?: string | null;
  routeShortName?: string | null;
  routeLongName?: string | null;
  agencyName?: string | null;
  fitBounds?: boolean;
}

export function useActiveRouteShapes(context: SelectedTripContext) {
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);

  const bkk = useBKKRouteShapes(context.routeId ?? null);
  const transitland = useTransitlandRouteShapes(
    activeAdapter === "transitland" ? (context.tripId ?? null) : null,
    context.routeId ?? null,
  );

  return activeAdapter === "bkk" ? bkk : transitland;
}

export function useActiveRouteStops(context: SelectedTripContext) {
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);
  return useTransitlandRouteStops(
    activeAdapter === "transitland" ? (context.tripId ?? null) : null,
    context.routeId ?? null,
  );
}

export function useActiveRouteTrips(
  routeId: string | null,
  serviceDate: string,
  startTime: string,
  endTime: string,
) {
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);
  return useTransitlandRouteTrips(
    activeAdapter === "transitland" ? routeId : null,
    serviceDate,
    startTime,
    endTime,
  );
}

export function useActiveStopDepartures(stopKey: string | null) {
  const activeAdapter = useAdapterStore((state) => state.activeAdapter);

  return useTransitlandStopDepartures(
    activeAdapter === "transitland" ? stopKey : null,
  );
}
