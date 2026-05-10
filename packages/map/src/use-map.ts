import { createContext, use } from "react";
import MapLibreGL from "maplibre-gl";

export interface MapContextValue {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
}

export const MapContext = createContext<MapContextValue | null>(null);

export function useMap() {
  const context = use(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}
