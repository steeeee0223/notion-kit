import {
  Bus,
  ShieldQuestion,
  Ship,
  Train,
  TrainFront,
  TramFront,
} from "lucide-react";

import { MapMarkerContent, MapMarkerLabel } from "@notion-kit/map";
import { Badge } from "@notion-kit/ui/primitives";
import { COLOR } from "@notion-kit/utils";

import type { VehiclePosition } from "@/adapters";

function getVehicleIconConfig(vehicle: VehiclePosition) {
  // If the route has a color specified by BKK, use it
  // if (vehicle.routeColor && vehicle.routeColor !== "#") {
  //   return { color: vehicle.routeColor, icon: ShieldQuestion };
  // }

  // Fallbacks
  switch (vehicle.vehicleType) {
    case "BUS":
      return { color: COLOR.blue.rgba, icon: Bus };
    case "TRAM":
      return { color: COLOR.yellow.rgba, icon: TramFront };
    case "TROLLEYBUS":
      return { color: COLOR.red.rgba, icon: Bus };
    case "SUBWAY":
      return { color: COLOR.green.rgba, icon: Train };
    case "RAIL":
      return { color: COLOR.purple.rgba, icon: TrainFront };
    case "FERRY":
      return { color: COLOR.orange.rgba, icon: Ship };
    default:
      return { color: COLOR.gray.rgba, icon: ShieldQuestion };
  }
}

/**
 * @deprecated Render with layer instead of DOM
 */
export function VehicleMarkerContent({
  vehicle,
}: {
  vehicle: VehiclePosition;
}) {
  const { color, icon: Icon } = getVehicleIconConfig(vehicle);
  // A subtle glow based on vehicle color to make it pop
  const glowStyle = {
    boxShadow: `0 0 10px ${color}80, 0 0 4px ${color}`,
    backgroundColor: color,
  };

  return (
    <MapMarkerContent>
      <div
        className="flex size-6 items-center justify-center rounded-full border-2 text-white transition-all duration-300 ease-in-out hover:scale-125"
        style={glowStyle}
      >
        <div
          className="flex size-full items-center justify-center"
          style={{ transform: `rotate(${vehicle.bearing || 0}deg)` }}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <MapMarkerLabel position="top">
        <Badge
          variant="tag"
          size="sm"
          style={{ backgroundColor: color }}
          className="rounded-sm"
        >
          {vehicle.routeShortName}
        </Badge>
      </MapMarkerLabel>
    </MapMarkerContent>
  );
}

export function VehicleIconPreview({
  type,
}: {
  type: VehiclePosition["vehicleType"];
}) {
  const { color, icon: Icon } = getVehicleIconConfig({
    vehicleType: type,
  } as VehiclePosition);

  return (
    <div
      className="flex size-5 items-center justify-center rounded-sm"
      style={{ backgroundColor: color }}
    >
      <Icon className="size-4" color="white" />
    </div>
  );
}
