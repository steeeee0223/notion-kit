import type { Meta, StoryObj } from "storybook-react-rsbuild";

import MapCustomGeoJsonLayer from "@notion-kit/registry/map-custom-geojson-layer";

const meta = {
  title: "Map/Custom GeoJSON Layer",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParksLayer: Story = {
  render: () => <MapCustomGeoJsonLayer />,
};
