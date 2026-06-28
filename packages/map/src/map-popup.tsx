import React, { useEffect, useMemo, useRef } from "react";
import MapLibreGL, { type PopupOptions } from "maplibre-gl";
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
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const container = useMemo(() => document.createElement("div"), []);

  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      offset: 20,
      maxWidth: "none",
      ...popupOptions,
      // Customized close button
      closeButton: false,
    }).setLngLat([longitude, latitude]);

    return popupInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePopupOptions(popup, popupOptions, { lngLat: [longitude, latitude] });

  useEffect(() => {
    if (!map) return;

    const onCloseProp = () => onCloseRef.current?.();

    popup.on("close", onCloseProp);

    popup.setDOMContent(container);
    popup.addTo(map);

    return () => {
      popup.off("close", onCloseProp);
      if (popup.isOpen()) {
        popup.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

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
