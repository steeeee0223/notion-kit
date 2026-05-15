import React from "react";
import { formatDistanceToNow } from "date-fns";

import {
  MapMarker,
  MapMarkerContent,
  MapMarkerPopup,
  MapMarkerTooltip,
  useCurrentLocation,
} from "@notion-kit/map";

export function MyLocation() {
  const { position } = useCurrentLocation();

  if (!position) return null;

  const { coords, timestamp } = position;
  const { latitude, longitude, altitude, heading, speed } = coords;
  const fields = [
    { id: "latitude", label: "Latitude", value: latitude.toFixed(4) },
    { id: "longitude", label: "Longitude", value: longitude.toFixed(4) },
    {
      id: "altitude",
      label: "Altitude",
      value: altitude?.toFixed(2) ?? "-",
    },
    { id: "heading", label: "Heading", value: heading?.toFixed(2) ?? "-" },
    { id: "speed", label: "Speed", value: speed?.toFixed(2) ?? "-" },
    {
      id: "timestamp",
      label: "Timestamp",
      value: formatDistanceToNow(timestamp),
    },
  ];

  return (
    <MapMarker longitude={longitude} latitude={latitude}>
      <MapMarkerContent />
      <MapMarkerPopup>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {fields.map((field) => {
            return (
              <React.Fragment key={field.id}>
                <span className="text-secondary">{field.label}</span>
                <span className="truncate">{field.value}</span>
              </React.Fragment>
            );
          })}
        </div>
      </MapMarkerPopup>
      <MapMarkerTooltip>I'm Here</MapMarkerTooltip>
    </MapMarker>
  );
}
