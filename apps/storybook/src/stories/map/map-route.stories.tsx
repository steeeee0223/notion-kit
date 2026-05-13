import type { Meta, StoryObj } from "storybook-react-rsbuild";

import {
  Map,
  MapControlGroup,
  MapControls,
  MapRoute,
  MapZoomIn,
  MapZoomOut,
} from "@notion-kit/map";

const meta = {
  title: "Map/Map Route",
  parameters: { layout: "fullscreen" },
  decorators: (Story) => (
    <div className="h-125 w-full">
      <Map center={[121.54, 25.04]} zoom={13}>
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
  render: () => <MapRoute coordinates={taipeiRoute} />,
};

export const Styled: Story = {
  render: () => (
    <MapRoute
      coordinates={taipeiRoute}
      color="#ef4444"
      width={5}
      opacity={0.9}
    />
  ),
};

export const Dashed: Story = {
  render: () => (
    <MapRoute
      coordinates={taipeiRoute}
      color="#8b5cf6"
      width={3}
      dashArray={[2, 2]}
    />
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
  ),
};
