import React, { useEffect, useEffectEvent, useMemo, useState } from "react";
import * as MapLibreGL from "maplibre-gl";
import type { PopupOptions } from "maplibre-gl";
import { createPortal } from "react-dom";

import { cn } from "@notion-kit/cn";
import { popup as popupStyle } from "@notion-kit/ui/primitives";

import { MapPopupClose } from "./map-marker";
import { useMap } from "./use-map";
import { usePopupOptions } from "./use-map-state";

export interface MapPopupProps extends PopupOptions, React.PropsWithChildren {
  /** Longitude coordinate for popup position */
  longitude: number;
  /** Latitude coordinate for popup position */
  latitude: number;
  /** Callback when popup is closed */
  onClose?: () => void;
}

export function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MapPopupProps) {
  const { map } = useMap();
  const notifyClose = useEffectEvent(() => onClose?.());
  const container = useMemo(() => document.createElement("div"), []);

  const [popup] = useState(() =>
    new MapLibreGL.Popup({
      offset: 20,
      maxWidth: "none",
      ...popupOptions,
      // Customized close button
      closeButton: false,
    }).setLngLat([longitude, latitude]),
  );

  usePopupOptions(popup, popupOptions, { lngLat: [longitude, latitude] });

  useEffect(() => {
    if (!map) return;

    popup.on("close", notifyClose);

    popup.setDOMContent(container);
    popup.addTo(map);

    return () => {
      popup.off("close", notifyClose);
      if (popup.isOpen()) {
        popup.remove();
      }
    };
  }, [container, map, popup]);

  return createPortal(
    <div
      data-slot="map-popup"
      className={cn(popupStyle({ type: "popover" }), "p-3", className)}
    >
      {closeButton && <MapPopupClose onClick={popup.remove} />}
      {children}
    </div>,
    container,
  );
}
