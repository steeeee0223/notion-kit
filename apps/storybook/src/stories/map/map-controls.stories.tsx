import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Map, MapControls } from "@notion-kit/map";

const meta = {
  title: "Map/Controls",
  component: MapControls,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: "500px", width: "100%" }}>
        <Map center={[121.5654, 25.033]} zoom={12}>
          <Story />
        </Map>
      </div>
    ),
  ],
} satisfies Meta<typeof MapControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllControls: Story = {
  args: {
    showZoom: true,
    showCompass: true,
    showLocate: true,
    showFullscreen: true,
  },
};

export const TopLeft: Story = {
  args: {
    position: "top-left",
    showZoom: true,
    showCompass: true,
  },
};

export const TopRight: Story = {
  args: {
    position: "top-right",
    showZoom: true,
    showFullscreen: true,
  },
};

export const BottomLeft: Story = {
  args: {
    position: "bottom-left",
    showZoom: true,
    showLocate: true,
  },
};
