import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Map, MapControls, MapRoute } from "@notion-kit/map";

const meta = {
  title: "Map/Route",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const taipeiRoute: [number, number][] = [
  [121.5169, 25.048],
  [121.5259, 25.0424],
  [121.5376, 25.0376],
  [121.5484, 25.0337],
  [121.5654, 25.033],
];

export const Default: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121.54, 25.04]} zoom={13}>
        <MapControls />
        <MapRoute coordinates={taipeiRoute} />
      </Map>
    </div>
  ),
};

export const Styled: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121.54, 25.04]} zoom={13}>
        <MapControls />
        <MapRoute
          coordinates={taipeiRoute}
          color="#ef4444"
          width={5}
          opacity={0.9}
        />
      </Map>
    </div>
  ),
};

export const Dashed: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121.54, 25.04]} zoom={13}>
        <MapControls />
        <MapRoute
          coordinates={taipeiRoute}
          color="#8b5cf6"
          width={3}
          dashArray={[2, 2]}
        />
      </Map>
    </div>
  ),
};

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

export const MultipleRoutes: Story = {
  render: () => (
    <div style={{ height: "500px", width: "100%" }}>
      <Map center={[121.54, 25.04]} zoom={13}>
        <MapControls />
        <MapRoute id="route-a" coordinates={routeA} color="#3b82f6" width={4} />
        <MapRoute
          id="route-b"
          coordinates={routeB}
          color="#f97316"
          width={3}
          dashArray={[3, 2]}
        />
      </Map>
    </div>
  ),
};
