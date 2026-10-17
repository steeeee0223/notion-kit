import type { ReactNode } from "react";

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

const routeA: [number, number][] = [
  [121.5169, 25.048],
  [121.5259, 25.0424],
  [121.5376, 25.0376],
  [121.5484, 25.0337],
  [121.5654, 25.033],
];

const routeB: [number, number][] = [
  [121.5169, 25.048],
  [121.519, 25.04],
  [121.525, 25.035],
  [121.5484, 25.03],
  [121.5654, 25.033],
];

const ExampleLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-125 w-full">
    <Map center={[121.54, 25.04]} zoom={13}>
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

const StyledContent = () => {
  return (
    <MapRoute
      coordinates={taipeiRoute}
      color="#ef4444"
      width={5}
      opacity={0.9}
    />
  );
};

export function StyledExample() {
  return (
    <ExampleLayout>
      <StyledContent />
    </ExampleLayout>
  );
}

const DashedContent = () => {
  return (
    <MapRoute
      coordinates={taipeiRoute}
      color="#8b5cf6"
      width={3}
      dashArray={[2, 2]}
    />
  );
};

export function DashedExample() {
  return (
    <ExampleLayout>
      <DashedContent />
    </ExampleLayout>
  );
}

const MultipleRoutesContent = () => {
  return (
    <>
      <MapRoute id="route-a" coordinates={routeA} color="#3b82f6" width={4} />
      <MapRoute
        id="route-b"
        coordinates={routeB}
        color="#f97316"
        width={3}
        dashArray={[3, 2]}
      />
    </>
  );
};

export function MultipleRoutesExample() {
  return (
    <ExampleLayout>
      <MultipleRoutesContent />
    </ExampleLayout>
  );
}
