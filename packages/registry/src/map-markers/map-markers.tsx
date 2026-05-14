"use client";

import {
  Map,
  MapControlGroup,
  MapControls,
  MapMarker,
  MapMarkerContent,
  MapMarkerLabel,
  MapMarkerPopup,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";

const locations = [
  {
    name: "Taipei 101",
    lng: 121.5654,
    lat: 25.033,
    desc: "Iconic 101-floor skyscraper",
  },
  {
    name: "Longshan Temple",
    lng: 121.4998,
    lat: 25.0372,
    desc: "Historic temple",
  },
  {
    name: "Shilin Night Market",
    lng: 121.5248,
    lat: 25.0881,
    desc: "Famous night market",
  },
];

export default function MapMarkersDemo() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-md border">
      <Map center={[121.54, 25.055]} zoom={12}>
        <MapControls>
          <MapControlGroup>
            <MapZoomIn />
            <MapZoomOut />
          </MapControlGroup>
        </MapControls>
        {locations.map((location) => (
          <MapMarker
            key={location.name}
            longitude={location.lng}
            latitude={location.lat}
          >
            <MapMarkerContent>
              <MapMarkerLabel>{location.name}</MapMarkerLabel>
              <div className="size-4 rounded-full border-2 border-white bg-blue shadow-lg" />
            </MapMarkerContent>
            <MapMarkerPopup closeButton className="min-w-36">
              <p className="font-semibold">{location.name}</p>
              <p className="text-xs text-muted">{location.desc}</p>
            </MapMarkerPopup>
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}
