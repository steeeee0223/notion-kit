import type { ReactNode } from "react";

import {
  Map,
  MapControlGroup,
  MapControls,
  MapPopup,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";

const ExampleLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-125 w-full">
    <Map center={[121.5654, 25.033]} zoom={13}>
      <MapControls>
        <MapControlGroup>
          <MapZoomIn />
          <MapZoomOut />
        </MapControlGroup>
      </MapControls>
      {children}
    </Map>
  </div>
);

const DefaultContent = () => {
  return (
    <MapPopup longitude={121.5654} latitude={25.033} closeButton>
      <div className="min-w-36">
        <p className="font-semibold">Taipei 101</p>
        <p className="text-xs text-muted">
          One of the tallest buildings in the world
        </p>
      </div>
    </MapPopup>
  );
};

export function DefaultExample() {
  return (
    <ExampleLayout>
      <DefaultContent />
    </ExampleLayout>
  );
}
