import type { ComponentProps, ReactNode } from "react";

import {
  Map,
  MapArc,
  MapControlGroup,
  MapControls,
  MapZoomIn,
  MapZoomOut,
  type MapArcDatum,
} from "@notion-kit/map";
import { toast } from "@notion-kit/ui/primitives";

const flightRoutes: MapArcDatum[] = [
  { id: "tpe-nrt", from: [121.5654, 25.033], to: [139.6917, 35.6895] },
  { id: "tpe-icn", from: [121.5654, 25.033], to: [126.978, 37.5665] },
  { id: "tpe-hkg", from: [121.5654, 25.033], to: [114.1694, 22.3193] },
  { id: "tpe-sin", from: [121.5654, 25.033], to: [103.8198, 1.3521] },
  { id: "tpe-bkk", from: [121.5654, 25.033], to: [100.5018, 13.7563] },
];

const ExampleLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-125 w-full">
    <Map center={[121, 25]} zoom={3}>
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

interface CustomStylingProps {
  curvature?: ComponentProps<typeof MapArc>["curvature"];
}
const CustomStylingContent = (overrides: CustomStylingProps) => {
  const args = {
    data: flightRoutes,
    curvature: 0.4,
    paint: {
      "line-color": "#8b5cf6",
      "line-width": 2.5,
      "line-opacity": 0.7,
    },
    hoverPaint: {
      "line-color": "#a78bfa",
      "line-width": 4,
      "line-opacity": 1,
    },
    ...overrides,
  } satisfies Partial<ComponentProps<typeof MapArc>>;
  return <MapArc {...args} />;
};

export function CustomStylingExample(props: CustomStylingProps) {
  return (
    <ExampleLayout>
      <CustomStylingContent {...props} />
    </ExampleLayout>
  );
}

const WithHoverStateContent = () => {
  const args = {
    data: flightRoutes,
    hoverPaint: {
      "line-color": "#ef4444",
      "line-width": 4,
      "line-opacity": 1,
    },
    onHover: (e) => toast(`Hovered: ${e?.arc.id}`),
  } satisfies Partial<ComponentProps<typeof MapArc>>;
  return <MapArc {...args} />;
};

export function WithHoverStateExample() {
  return (
    <ExampleLayout>
      <WithHoverStateContent />
    </ExampleLayout>
  );
}

interface HighCurvatureProps {
  curvature?: ComponentProps<typeof MapArc>["curvature"];
}
const HighCurvatureContent = (overrides: HighCurvatureProps) => {
  const args = {
    data: flightRoutes,
    curvature: 0.6,
    paint: { "line-color": "#06b6d4", "line-width": 2 },
    ...overrides,
  } satisfies Partial<ComponentProps<typeof MapArc>>;
  return <MapArc {...args} />;
};

export function HighCurvatureExample(props: HighCurvatureProps) {
  return (
    <ExampleLayout>
      <HighCurvatureContent {...props} />
    </ExampleLayout>
  );
}

interface StraightLinesProps {
  curvature?: ComponentProps<typeof MapArc>["curvature"];
}
const StraightLinesContent = (overrides: StraightLinesProps) => {
  const args = {
    data: flightRoutes,
    curvature: 0,
    paint: {
      "line-color": "#f59e0b",
      "line-width": 1.5,
      "line-opacity": 0.6,
    },
    ...overrides,
  } satisfies Partial<ComponentProps<typeof MapArc>>;
  return <MapArc {...args} />;
};

export function StraightLinesExample(props: StraightLinesProps) {
  return (
    <ExampleLayout>
      <StraightLinesContent {...props} />
    </ExampleLayout>
  );
}
