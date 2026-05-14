"use client";

import {
  Map,
  MapCompass,
  MapControlGroup,
  MapControls,
  MapFullScreen,
  MapLocate,
  MapViewModeToggle,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";
import { Separator } from "@notion-kit/ui/primitives";

export default function MapControlsDemo() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-md border">
      <Map center={[121.5654, 25.033]} zoom={12}>
        <MapControls>
          <MapControlGroup>
            <MapZoomIn />
            <MapZoomOut />
            <Separator />
            <MapLocate />
            <MapViewModeToggle />
            <MapCompass />
            <MapFullScreen />
          </MapControlGroup>
        </MapControls>
      </Map>
    </div>
  );
}
