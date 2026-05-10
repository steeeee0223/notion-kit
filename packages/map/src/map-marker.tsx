import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import MapLibreGL, { type MarkerOptions, type PopupOptions } from "maplibre-gl";
import { createPortal } from "react-dom";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  contentVariants,
  tooltipVariants,
} from "@notion-kit/ui/primitives";

import { useMap } from "./use-map";

interface MarkerContextValue {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
}

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = use(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
}

export type MapMarkerProps = {
  /** Longitude coordinate for marker position */
  longitude: number;
  /** Latitude coordinate for marker position */
  latitude: number;
  /** Marker subcomponents (MapMarkerContent, MapMarkerPopup, MapMarkerTooltip, MapMarkerLabel) */
  children: ReactNode;
  /** Callback when marker is clicked */
  onClick?: (e: MouseEvent) => void;
  /** Callback when mouse enters marker */
  onMouseEnter?: (e: MouseEvent) => void;
  /** Callback when mouse leaves marker */
  onMouseLeave?: (e: MouseEvent) => void;
  /** Callback when marker drag starts (requires draggable: true) */
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback during marker drag (requires draggable: true) */
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback when marker drag ends (requires draggable: true) */
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();

  const callbacksRef = useRef({
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
  });
  callbacksRef.current = {
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
  };

  const marker = useMemo(() => {
    const element = document.createElement("div");
    element.dataset.slot = "map-marker";

    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element,
      draggable,
    }).setLngLat([longitude, latitude]);

    const handleClick = (e: MouseEvent) => callbacksRef.current.onClick?.(e);
    const handleMouseEnter = (e: MouseEvent) =>
      callbacksRef.current.onMouseEnter?.(e);
    const handleMouseLeave = (e: MouseEvent) =>
      callbacksRef.current.onMouseLeave?.(e);

    markerInstance.getElement().addEventListener("click", handleClick);
    markerInstance
      .getElement()
      .addEventListener("mouseenter", handleMouseEnter);
    markerInstance
      .getElement()
      .addEventListener("mouseleave", handleMouseLeave);

    const handleDragStart = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDrag = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDragEnd = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
    };

    markerInstance.on("dragstart", handleDragStart);
    markerInstance.on("drag", handleDrag);
    markerInstance.on("dragend", handleDragEnd);

    return markerInstance;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;

    marker.addTo(map);

    return () => {
      marker.remove();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (
    marker.getLngLat().lng !== longitude ||
    marker.getLngLat().lat !== latitude
  ) {
    marker.setLngLat([longitude, latitude]);
  }
  if (marker.isDraggable() !== draggable) {
    marker.setDraggable(draggable);
  }

  const currentOffset = marker.getOffset();
  const newOffset = markerOptions.offset ?? [0, 0];
  const [newOffsetX, newOffsetY] = Array.isArray(newOffset)
    ? newOffset
    : [newOffset.x, newOffset.y];
  if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
    marker.setOffset(newOffset);
  }

  if (marker.getRotation() !== markerOptions.rotation) {
    marker.setRotation(markerOptions.rotation ?? 0);
  }
  if (marker.getRotationAlignment() !== markerOptions.rotationAlignment) {
    marker.setRotationAlignment(markerOptions.rotationAlignment ?? "auto");
  }
  if (marker.getPitchAlignment() !== markerOptions.pitchAlignment) {
    marker.setPitchAlignment(markerOptions.pitchAlignment ?? "auto");
  }

  const contextValue = useMemo(() => ({ marker, map }), [marker, map]);

  return <MarkerContext value={contextValue}>{children}</MarkerContext>;
}

export interface MapMarkerContentProps {
  /** Custom marker content. Defaults to a blue dot if not provided */
  children?: ReactNode;
  /** Additional CSS classes for the marker container */
  className?: string;
}

export function MapMarkerContent({
  children,
  className,
}: MapMarkerContentProps) {
  const { marker } = useMarkerContext();

  return createPortal(
    <div
      data-slot="map-marker-content"
      className={cn("relative cursor-pointer", className)}
    >
      {children ?? <MapDefaultMarkerIcon />}
    </div>,
    marker.getElement(),
  );
}

function MapDefaultMarkerIcon() {
  return (
    <div
      data-slot="map-default-marker-icon"
      className="relative size-4 rounded-full border-2 border-main bg-blue shadow-lg"
    />
  );
}

export function MapPopupClose({ onClick }: { onClick: () => void }) {
  return (
    <Button
      data-slot="map-popup-close"
      type="button"
      onClick={onClick}
      aria-label="Close popup"
      variant="close"
      size="circle"
      className="absolute top-0.5 right-0.5 z-10"
    >
      <Icon.Close className="size-3.5 fill-current" />
    </Button>
  );
}

export interface MapMarkerPopupProps extends PopupOptions {
  /** Popup content */
  children: ReactNode;
}

export function MapMarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MapMarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const prevPopupOptions = useRef(popupOptions);

  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth("none")
      .setDOMContent(container);

    return popupInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;

    popup.setDOMContent(container);
    marker.setPopup(popup);

    return () => {
      marker.setPopup(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (popup.isOpen()) {
    const prev = prevPopupOptions.current;

    if (prev.offset !== popupOptions.offset) {
      popup.setOffset(popupOptions.offset ?? 16);
    }
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
      popup.setMaxWidth(popupOptions.maxWidth ?? "none");
    }

    prevPopupOptions.current = popupOptions;
  }

  const handleClose = () => popup.remove();

  return createPortal(
    <div
      data-slot="map-marker-popup"
      className={cn(
        contentVariants({ variant: "popover", openAnimation: true }),
        className,
      )}
    >
      {closeButton && <MapPopupClose onClick={handleClose} />}
      {children}
    </div>,
    container,
  );
}

export interface MapMarkerTooltipProps
  extends Omit<PopupOptions, "closeButton" | "closeOnClick"> {
  /** Tooltip content */
  children: ReactNode;
}

export function MapMarkerTooltip({
  children,
  className,
  ...popupOptions
}: MapMarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const prevTooltipOptions = useRef(popupOptions);

  const tooltip = useMemo(() => {
    const tooltipInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeOnClick: true,
      closeButton: false,
    }).setMaxWidth("none");

    return tooltipInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;

    tooltip.setDOMContent(container);

    const handleMouseEnter = () => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map);
    };
    const handleMouseLeave = () => tooltip.remove();

    marker.getElement().addEventListener("mouseenter", handleMouseEnter);
    marker.getElement().addEventListener("mouseleave", handleMouseLeave);

    return () => {
      marker.getElement().removeEventListener("mouseenter", handleMouseEnter);
      marker.getElement().removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (tooltip.isOpen()) {
    const prev = prevTooltipOptions.current;

    if (prev.offset !== popupOptions.offset) {
      tooltip.setOffset(popupOptions.offset ?? 16);
    }
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
      tooltip.setMaxWidth(popupOptions.maxWidth ?? "none");
    }

    prevTooltipOptions.current = popupOptions;
  }

  return createPortal(
    <div
      data-slot="map-marker-tooltip"
      className={cn(
        contentVariants({ variant: "tooltip", openAnimation: true }),
        tooltipVariants({ size: "sm" }),
        className,
      )}
    >
      {children}
    </div>,
    container,
  );
}

export interface MapMarkerLabelProps extends React.ComponentProps<"div"> {
  /** Position of the label relative to the marker (default: "top") */
  position?: "top" | "bottom";
}

export function MapMarkerLabel({
  position = "top",
  className,
  ...props
}: MapMarkerLabelProps) {
  const positionClasses = {
    top: "bottom-full mb-1",
    bottom: "top-full mt-1",
  };

  return (
    <div
      data-slot="map-marker-label"
      className={cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
        "text-[10px] font-medium text-primary",
        positionClasses[position],
        className,
      )}
      {...props}
    />
  );
}
