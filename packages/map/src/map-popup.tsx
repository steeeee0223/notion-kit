import { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { createPortal } from "react-dom";

import { useMap } from "./use-map";

export interface MapPopupProps {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  className?: string;
  closeButton?: boolean;
  onClose?: () => void;
  offset?: number;
}

function MapPopup({
  longitude,
  latitude,
  children,
  className,
  closeButton = false,
  onClose,
  offset = 10,
}: MapPopupProps) {
  const { map } = useMap();
  const [container] = useState(() => {
    const el = document.createElement("div");
    if (className) el.className = className;
    return el;
  });

  useEffect(() => {
    if (!map) return;

    const popup = new maplibregl.Popup({
      closeButton,
      closeOnClick: false,
      offset,
      className: "mapcn-popup",
    })
      .setLngLat([longitude, latitude])
      .setDOMContent(container)
      .addTo(map);

    if (onClose) {
      popup.on("close", onClose);
    }

    return () => {
      popup.remove();
    };
  }, [map, longitude, latitude, closeButton, onClose, offset, container]);

  return createPortal(children, container);
}

export { MapPopup };
