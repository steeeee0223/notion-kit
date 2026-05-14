"use client";

import {
  Map,
  MapControlGroup,
  MapControls,
  MapRoute,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";

const taipeiRoute: [number, number][] = [
  [121.5169, 25.048],
  [121.5259, 25.0424],
  [121.5376, 25.0376],
  [121.5484, 25.0337],
  [121.5654, 25.033],
];

export default function MapRouteDemo() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-md border">
      <Map center={[121.54, 25.04]} zoom={13}>
        <MapControls>
          <MapControlGroup>
            <MapZoomIn />
            <MapZoomOut />
          </MapControlGroup>
        </MapControls>
        <MapRoute coordinates={taipeiRoute} color="#ef4444" width={5} />
      </Map>
    </div>
  );
}
