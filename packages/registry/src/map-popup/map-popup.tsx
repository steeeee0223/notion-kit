"use client";

import { useEffect, useState } from "react";
import type { MapMouseEvent } from "maplibre-gl";

import {
  Map,
  MapControlGroup,
  MapControls,
  MapPopup,
  MapZoomIn,
  MapZoomOut,
  useMap,
} from "@notion-kit/map";

function ClickPopup() {
  const { map, isLoaded } = useMap();
  const [popup, setPopup] = useState<{ lng: number; lat: number } | null>(null);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleClick = (event: MapMouseEvent) => {
      setPopup({ lng: event.lngLat.lng, lat: event.lngLat.lat });
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [isLoaded, map]);

  if (!popup) return null;

  return (
    <MapPopup
      longitude={popup.lng}
      latitude={popup.lat}
      closeButton
      onClose={() => setPopup(null)}
    >
      <div className="min-w-24">
        <p className="text-xs font-medium">Clicked at</p>
        <p className="font-mono text-xs text-muted">
          {popup.lng.toFixed(4)}, {popup.lat.toFixed(4)}
        </p>
      </div>
    </MapPopup>
  );
}

export default function MapPopupDemo() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-md border">
      <Map center={[121.5654, 25.033]} zoom={13}>
        <MapControls>
          <MapControlGroup>
            <MapZoomIn />
            <MapZoomOut />
          </MapControlGroup>
        </MapControls>
        <ClickPopup />
      </Map>
    </div>
  );
}
