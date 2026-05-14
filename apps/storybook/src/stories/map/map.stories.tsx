import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Map, type MapViewport } from "@notion-kit/map";
import { Button } from "@notion-kit/ui/primitives";

const meta = {
  title: "Map/Map",
  component: Map,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-125 w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    center: [121.5654, 25.033],
    zoom: 12,
  },
};

export const DarkTheme: Story = {
  args: {
    center: [-73.9857, 40.7484],
    zoom: 13,
    theme: "dark",
  },
};

export const LightTheme: Story = {
  args: {
    center: [2.3522, 48.8566],
    zoom: 11,
    theme: "light",
  },
};

export const Globe: Story = {
  args: {
    center: [0, 20],
    zoom: 1.5,
    projection: { type: "globe" },
  },
};

export const ControlledViewport: Story = {
  render: function ControlledViewportStory() {
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
            {viewport.center?.[0].toFixed(4)}, {viewport.center?.[1].toFixed(4)}{" "}
            | zoom: {viewport.zoom?.toFixed(1)}
          </span>
        </div>
        <div className="flex-1">
          <Map viewport={viewport} onViewportChange={setViewport} />
        </div>
      </div>
    );
  },
};
