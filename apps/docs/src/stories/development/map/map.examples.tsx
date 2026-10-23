import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { Map, type MapViewport } from "@notion-kit/map";
import { Button } from "@notion-kit/ui/primitives";

const ExampleLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-125 w-full">{children}</div>
);

interface DarkThemeProps {
  zoom?: ComponentProps<typeof Map>["zoom"];
  theme?: ComponentProps<typeof Map>["theme"];
}
const DarkThemeContent = (overrides: DarkThemeProps) => {
  const args = {
    center: [-73.9857, 40.7484],
    zoom: 13,
    theme: "dark",
    ...overrides,
  } satisfies Partial<ComponentProps<typeof Map>>;
  return <Map {...args} />;
};

export function DarkThemeExample(props: DarkThemeProps) {
  return (
    <ExampleLayout>
      <DarkThemeContent {...props} />
    </ExampleLayout>
  );
}

interface LightThemeProps {
  zoom?: ComponentProps<typeof Map>["zoom"];
  theme?: ComponentProps<typeof Map>["theme"];
}
const LightThemeContent = (overrides: LightThemeProps) => {
  const args = {
    center: [2.3522, 48.8566],
    zoom: 11,
    theme: "light",
    ...overrides,
  } satisfies Partial<ComponentProps<typeof Map>>;
  return <Map {...args} />;
};

export function LightThemeExample(props: LightThemeProps) {
  return (
    <ExampleLayout>
      <LightThemeContent {...props} />
    </ExampleLayout>
  );
}

interface GlobeProps {
  zoom?: ComponentProps<typeof Map>["zoom"];
}
const GlobeContent = (overrides: GlobeProps) => {
  const args = {
    center: [0, 20],
    zoom: 1.5,
    projection: { type: "globe" },
    ...overrides,
  } satisfies Partial<ComponentProps<typeof Map>>;
  return <Map {...args} />;
};

export function GlobeExample(props: GlobeProps) {
  return (
    <ExampleLayout>
      <GlobeContent {...props} />
    </ExampleLayout>
  );
}

const ControlledViewportContent = () => {
  const [viewport, setViewport] = useState<Partial<MapViewport>>({
    center: [121.5654, 25.033],
    zoom: 12,
    bearing: 0,
    pitch: 0,
  });

  return (
    <div className="flex h-[500px] w-full flex-col">
      <div className="flex gap-2 p-2">
        <Button
          variant="blue"
          size="sm"
          onClick={() =>
            setViewport((v) => ({ ...v, center: [-73.9857, 40.7484] }))
          }
        >
          NYC
        </Button>
        <Button
          variant="blue"
          size="sm"
          onClick={() =>
            setViewport((v) => ({ ...v, center: [139.6917, 35.6895] }))
          }
        >
          Tokyo
        </Button>
        <Button
          variant="blue"
          size="sm"
          onClick={() =>
            setViewport((v) => ({ ...v, center: [121.5654, 25.033] }))
          }
        >
          Taipei
        </Button>
        <span className="ml-auto self-center text-xs text-muted">
          {viewport.center?.[0].toFixed(4)}, {viewport.center?.[1].toFixed(4)} |
          zoom: {viewport.zoom?.toFixed(1)}
        </span>
      </div>
      <div className="flex-1">
        <Map viewport={viewport} onViewportChange={setViewport} />
      </div>
    </div>
  );
};

export function ControlledViewportExample() {
  return (
    <ExampleLayout>
      <ControlledViewportContent />
    </ExampleLayout>
  );
}
