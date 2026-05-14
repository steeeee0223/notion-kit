"use client";

import {
  Map,
  MapArc,
  MapControlGroup,
  MapControls,
  MapZoomIn,
  MapZoomOut,
  type MapArcDatum,
} from "@notion-kit/map";

const flightRoutes: MapArcDatum[] = [
  { id: "tpe-nrt", from: [121.5654, 25.033], to: [139.6917, 35.6895] },
  { id: "tpe-icn", from: [121.5654, 25.033], to: [126.978, 37.5665] },
  { id: "tpe-hkg", from: [121.5654, 25.033], to: [114.1694, 22.3193] },
  { id: "tpe-sin", from: [121.5654, 25.033], to: [103.8198, 1.3521] },
  { id: "tpe-bkk", from: [121.5654, 25.033], to: [100.5018, 13.7563] },
];

export default function MapArcDemo() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-md border">
      <Map center={[121, 25]} zoom={3}>
        <MapControls>
          <MapControlGroup>
            <MapZoomIn />
            <MapZoomOut />
          </MapControlGroup>
        </MapControls>
        <MapArc
          data={flightRoutes}
          paint={{ "line-color": "#8b5cf6", "line-width": 2.5 }}
          hoverPaint={{ "line-color": "#ef4444", "line-width": 4 }}
        />
      </Map>
    </div>
  );
}
