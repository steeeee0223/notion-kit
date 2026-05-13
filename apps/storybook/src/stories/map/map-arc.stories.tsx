import type { Meta, StoryObj } from "storybook-react-rsbuild";

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

const meta = {
  title: "Map/Map Arc",
  component: MapArc,
  parameters: { layout: "fullscreen" },
  args: {
    data: flightRoutes,
  },
  decorators: (Story) => (
    <div className="h-125 w-full">
      <Map center={[121, 25]} zoom={3}>
        <MapControls>
          <MapControlGroup>
            <MapZoomIn />
            <MapZoomOut />
          </MapControlGroup>
        </MapControls>
        <Story />
      </Map>
    </div>
  ),
} satisfies Meta<typeof MapArc>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomStyling: Story = {
  args: {
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
  },
};

export const WithHoverState: Story = {
  args: {
    hoverPaint: {
      "line-color": "#ef4444",
      "line-width": 4,
      "line-opacity": 1,
    },
    onHover: (e) => toast(`Hovered: ${e?.arc.id}`),
  },
};

export const HighCurvature: Story = {
  args: {
    curvature: 0.6,
    paint: { "line-color": "#06b6d4", "line-width": 2 },
  },
};

export const StraightLines: Story = {
  args: {
    curvature: 0,
    paint: {
      "line-color": "#f59e0b",
      "line-width": 1.5,
      "line-opacity": 0.6,
    },
  },
};
