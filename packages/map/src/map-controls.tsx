import { useCallback } from "react";

import { cn, cva, type VariantProps } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  groupVariants,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { useCurrentLocation } from "./use-current-location";
import { useMap } from "./use-map";
import { useMapBearing, useMapPitch } from "./use-map-state";

const positionClasses = cva("", {
  variants: {
    position: {
      "top-left": "top-2 left-2",
      "top-right": "top-2 right-2",
      "bottom-left": "bottom-2 left-2",
      "bottom-right": "right-2 bottom-10",
    },
  },
});
type Position = VariantProps<typeof positionClasses>["position"];

export interface MapControlsProps extends React.PropsWithChildren {
  /** Position of the controls on the map (default: "bottom-right") */
  position?: Position;
  className?: string;
}

function MapControls({
  position = "bottom-right",
  className,
  ...props
}: MapControlsProps) {
  return (
    <div
      data-slot="map-controls"
      className={cn(
        "absolute z-10 flex flex-col gap-1.5",
        positionClasses({ position }),
        className,
      )}
      {...props}
    />
  );
}

function MapControlGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="map-control-group"
      className={cn(
        groupVariants(),
        "w-7 items-center overflow-hidden rounded-md border border-border bg-main py-0.5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function MapControlButton({
  "aria-label": label = "",
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <TooltipPreset description={label} collisionPadding={16} side="left">
      <Button
        variant="hint"
        className={cn("size-6 [&_svg]:fill-current", className)}
        aria-label={label}
        {...props}
      />
    </TooltipPreset>
  );
}

interface MapControlProps {
  className?: string;
}

function MapZoomIn({ className }: MapControlProps) {
  const { map } = useMap();
  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);
  return (
    <MapControlButton
      onClick={handleZoomIn}
      aria-label="Zoom in"
      className={className}
    >
      <Icon.Plus className="size-3.5!" />
    </MapControlButton>
  );
}

function MapZoomOut({ className }: MapControlProps) {
  const { map } = useMap();
  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);
  return (
    <MapControlButton
      onClick={handleZoomOut}
      aria-label="Zoom out"
      className={className}
    >
      <Icon.Minus className="size-3.5!" />
    </MapControlButton>
  );
}

interface MapLocateProps extends MapControlProps {
  /** Callback with user coordinates when located */
  onLocate?: (coords: { lng: number; lat: number }) => void;
}

function MapLocate({ className, onLocate }: MapLocateProps) {
  const { map } = useMap();
  const { coordinates } = useCurrentLocation();

  return (
    <MapControlButton
      onClick={() => {
        if (!coordinates) return;
        const location = {
          lng: coordinates[0],
          lat: coordinates[1],
        };
        void map?.flyTo({
          center: location,
          zoom: 14,
          duration: 1500,
        });
        onLocate?.(location);
      }}
      aria-label="Find my location"
      className={className}
    >
      <Icon.Locate />
    </MapControlButton>
  );
}

function MapFullScreen({ className }: MapControlProps) {
  const { map } = useMap();
  return (
    <MapControlButton
      onClick={() => {
        const container = map?.getContainer();
        if (!container) return;
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          void container.requestFullscreen();
        }
      }}
      aria-label="Toggle fullscreen"
      className={className}
    >
      <Icon.Maximize />
    </MapControlButton>
  );
}

function MapCompass({ className }: MapControlProps) {
  const { map } = useMap();
  const bearing = useMapBearing();
  const pitch = useMapPitch();

  return (
    <MapControlButton
      onClick={() => map?.resetNorthPitch({ duration: 300 })}
      aria-label="Reset bearing to north"
      className={className}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5 transition-transform duration-200"
        style={{
          transform: `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
        <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
        <path d="M12 22L16 12H12V22Z" className="fill-icon" />
        <path d="M12 22L8 12H12V22Z" className="fill-icon-secondary" />
      </svg>
    </MapControlButton>
  );
}

export {
  MapControls,
  MapControlGroup,
  MapCompass,
  MapFullScreen,
  MapZoomIn,
  MapZoomOut,
  MapLocate,
};
