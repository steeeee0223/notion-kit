import { useCallback, useEffect, useRef, useState } from "react";

import { cn, cva, type VariantProps } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button, Spinner } from "@notion-kit/ui/primitives";

import { useMap } from "./use-map";

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

export interface MapControlsProps {
  /** Position of the controls on the map (default: "bottom-right") */
  position?: Position;
  /** Show zoom in/out buttons (default: true) */
  showZoom?: boolean;
  /** Show compass button to reset bearing (default: false) */
  showCompass?: boolean;
  /** Show locate button to find user's location (default: false) */
  showLocate?: boolean;
  /** Show fullscreen toggle button (default: false) */
  showFullscreen?: boolean;
  /** Additional CSS classes for the controls container */
  className?: string;
  /** Callback with user coordinates when located */
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
}

function MapControlGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="map-control-group"
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-border bg-main shadow-sm [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border",
        className,
      )}
      {...props}
    />
  );
}

export function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}: MapControlsProps) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);

  const handleResetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 });
  }, [map]);

  const handleLocate = useCallback(() => {
    setWaitingForLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          };
          void map?.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 14,
            duration: 1500,
          });
          onLocate?.(coords);
          setWaitingForLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setWaitingForLocation(false);
        },
      );
    }
  }, [map, onLocate]);

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen();
    }
  }, [map]);

  return (
    <div
      data-slot="map-controls"
      className={cn(
        "absolute z-10 flex flex-col gap-1.5",
        positionClasses({ position }),
        className,
      )}
    >
      {showZoom && (
        <MapControlGroup>
          <Button onClick={handleZoomIn} aria-label="Zoom in">
            <Icon.Plus className="size-4 fill-current" />
          </Button>
          <Button onClick={handleZoomOut} aria-label="Zoom out">
            <Icon.Minus className="size-4 fill-current" />
          </Button>
        </MapControlGroup>
      )}
      {showCompass && (
        <MapControlGroup>
          <MapCompassButton onClick={handleResetBearing} />
        </MapControlGroup>
      )}
      {showLocate && (
        <MapControlGroup>
          <Button
            onClick={handleLocate}
            aria-label="Find my location"
            disabled={waitingForLocation}
          >
            {waitingForLocation ? (
              <Spinner />
            ) : (
              <Icon.Locate className="size-4 fill-current" />
            )}
          </Button>
        </MapControlGroup>
      )}
      {showFullscreen && (
        <MapControlGroup>
          <Button onClick={handleFullscreen} aria-label="Toggle fullscreen">
            <Icon.Maximize className="size-4 fill-current" />
          </Button>
        </MapControlGroup>
      )}
    </div>
  );
}

function MapCompassButton({ onClick }: { onClick: () => void }) {
  const { map } = useMap();
  const compassRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!map || !compassRef.current) return;

    const compass = compassRef.current;

    const updateRotation = () => {
      const bearing = map.getBearing();
      const pitch = map.getPitch();
      compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`;
    };

    map.on("rotate", updateRotation);
    map.on("pitch", updateRotation);
    updateRotation();

    return () => {
      map.off("rotate", updateRotation);
      map.off("pitch", updateRotation);
    };
  }, [map]);

  return (
    <Button onClick={onClick} aria-label="Reset bearing to north">
      <svg
        ref={compassRef}
        viewBox="0 0 24 24"
        className="size-5 transition-transform duration-200"
        style={{ transformStyle: "preserve-3d" }}
      >
        <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
        <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
        <path d="M12 22L16 12H12V22Z" className="fill-icon" />
        <path d="M12 22L8 12H12V22Z" className="fill-icon-secondary" />
      </svg>
    </Button>
  );
}
