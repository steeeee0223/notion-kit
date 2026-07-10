import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { MeterBar, MeterRing, MeterValue } from "@notion-kit/ui/primitives";
import { COLOR } from "@notion-kit/utils";

const meta = {
  title: "Shadcn/Meter",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bar: Story = {
  render: () => (
    <MeterBar
      value={60}
      trackColor={COLOR.blue.hex}
      format={{
        style: "currency",
        currency: "USD",
      }}
      className="w-40 gap-2"
    >
      <MeterValue className="text-xs" />
    </MeterBar>
  ),
};

export const Ring: Story = {
  render: () => (
    <MeterRing
      value={60}
      trackColor={COLOR.yellow.hex}
      className="w-20 items-center gap-2"
    >
      <MeterValue className="text-xs" />
    </MeterRing>
  ),
};
