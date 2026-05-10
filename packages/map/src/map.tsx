import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import { cn } from "@notion-kit/cn";

export interface MapViewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface MapContextValue {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

export const MapContext = createContext<MapContextValue>({
  map: null,
  isLoaded: false,
});

interface MapStyles {
  light?: string | maplibregl.StyleSpecification;
  dark?: string | maplibregl.StyleSpecification;
}

const DEFAULT_STYLES: MapStyles = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

export interface MapProps {
  children?: React.ReactNode;
  className?: string;
  theme?: "light" | "dark";
  styles?: MapStyles;
  center?: [number, number];
  zoom?: number;
  bearing?: number;
  pitch?: number;
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
  maxZoom?: number;
  minZoom?: number;
}

function Map({
  children,
  className,
  theme = "dark",
  styles,
  center = [0, 20],
  zoom = 2,
  bearing = 0,
  pitch = 0,
  viewport,
  onViewportChange,
  maxZoom,
  minZoom,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  const getStyle = useCallback(
    (t: "light" | "dark") => {
      const s = styles ?? DEFAULT_STYLES;
      return (t === "dark" ? s.dark : s.light) ?? DEFAULT_STYLES.dark!;
    },
    [styles],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getStyle(theme),
      center: viewport?.center ?? center,
      zoom: viewport?.zoom ?? zoom,
      bearing: viewport?.bearing ?? bearing,
      pitch: viewport?.pitch ?? pitch,
      maxZoom,
      minZoom,
      attributionControl: false,
    });

    map.on("load", () => {
      setIsLoaded(true);
      setMapInstance(map);
    });

    if (onViewportChange) {
      map.on("moveend", () => {
        const c = map.getCenter();
        onViewportChange({
          center: [c.lng, c.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setIsLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getStyle(theme));
  }, [theme, getStyle]);

  const contextValue = useMemo<MapContextValue>(
    () => ({ map: mapInstance, isLoaded }),
    [mapInstance, isLoaded],
  );

  return (
    <MapContext value={contextValue}>
      <div ref={containerRef} className={cn("relative size-full", className)}>
        {isLoaded && children}
      </div>
    </MapContext>
  );
}

export { Map };
