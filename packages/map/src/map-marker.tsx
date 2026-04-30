import { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { createPortal } from "react-dom";

import { useMap } from "./use-map";

export interface MapMarkerProps {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
  className?: string;
}

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  className,
}: MapMarkerProps) {
  const { map } = useMap();
  const [container] = useState(() => {
    const el = document.createElement("div");
    if (className) el.className = className;
    return el;
  });

  useEffect(() => {
    if (!map) return;

    const marker = new maplibregl.Marker({ element: container })
      .setLngLat([longitude, latitude])
      .addTo(map);

    if (onClick) {
      container.addEventListener("click", onClick);
    }

    return () => {
      if (onClick) {
        container.removeEventListener("click", onClick);
      }
      marker.remove();
    };
  }, [map, longitude, latitude, onClick, container]);

  return createPortal(children, container);
}

export { MapMarker };
