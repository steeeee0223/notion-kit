import { useEffect } from "react";
import maplibregl from "maplibre-gl";

import { useMap } from "./use-map";

export interface MapControlsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showFullscreen?: boolean;
}

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showFullscreen = false,
}: MapControlsProps) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const controls: maplibregl.IControl[] = [];

    if (showZoom) {
      const nav = new maplibregl.NavigationControl({
        showCompass,
        showZoom: true,
      });
      map.addControl(nav, position);
      controls.push(nav);
    }

    if (showFullscreen) {
      const fs = new maplibregl.FullscreenControl();
      map.addControl(fs, position);
      controls.push(fs);
    }

    return () => {
      controls.forEach((c) => {
        try {
          map.removeControl(c);
        } catch {
          // control may already be removed
        }
      });
    };
  }, [map, position, showZoom, showCompass, showFullscreen]);

  return null;
}

export { MapControls };
