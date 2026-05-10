import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import {
  Map,
  MapArc,
  MapControls,
  type MapArcDatum,
  type MapArcEvent,
} from "@notion-kit/map";

const meta = {
  title: "Map/Arc",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const flightRoutes: MapArcDatum[] = [
  { id: "tpe-nrt", from: [121.5654, 25.033], to: [139.6917, 35.6895] },
  { id: "tpe-icn", from: [121.5654, 25.033], to: [126.978, 37.5665] },
  { id: "tpe-hkg", from: [121.5654, 25.033], to: [114.1694, 22.3193] },
  { id: "tpe-sin", from: [121.5654, 25.033], to: [103.8198, 1.3521] },
  { id: "tpe-bkk", from: [121.5654, 25.033], to: [100.5018, 13.7563] },
];

export const Default: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121, 25]} zoom={3}>
        <MapControls />
        <MapArc data={flightRoutes} />
      </Map>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121, 25]} zoom={3}>
        <MapControls />
        <MapArc
          data={flightRoutes}
          curvature={0.4}
          paint={{
            "line-color": "#8b5cf6",
            "line-width": 2.5,
            "line-opacity": 0.7,
          }}
          hoverPaint={{
            "line-color": "#a78bfa",
            "line-width": 4,
            "line-opacity": 1,
          }}
        />
      </Map>
    </div>
  ),
};

export const WithHoverState: Story = {
  render: function HoverStory() {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
      <div className="flex h-[500px] w-full flex-col">
        <div className="border-b bg-main px-3 py-2 font-mono text-xs text-muted">
          {hovered ? `Hovered: ${hovered}` : "Hover over an arc"}
        </div>
        <div className="flex-1">
          <Map center={[121, 25]} zoom={3}>
            <MapControls />
            <MapArc
              data={flightRoutes}
              hoverPaint={{
                "line-color": "#ef4444",
                "line-width": 4,
                "line-opacity": 1,
              }}
              onHover={(e: MapArcEvent | null) =>
                setHovered(e ? String(e.arc.id) : null)
              }
            />
          </Map>
        </div>
      </div>
    );
  },
};

export const HighCurvature: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121, 25]} zoom={3}>
        <MapControls />
        <MapArc
          data={flightRoutes}
          curvature={0.6}
          paint={{ "line-color": "#06b6d4", "line-width": 2 }}
        />
      </Map>
    </div>
  ),
};

export const StraightLines: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121, 25]} zoom={3}>
        <MapControls />
        <MapArc
          data={flightRoutes}
          curvature={0}
          paint={{
            "line-color": "#f59e0b",
            "line-width": 1.5,
            "line-opacity": 0.6,
          }}
        />
      </Map>
    </div>
  ),
};
