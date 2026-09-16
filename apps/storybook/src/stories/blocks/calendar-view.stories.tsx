import type { Meta, StoryObj } from "storybook-react-rsbuild";

import CalendarDemo from "@notion-kit/registry/calendar-demo";

const meta = {
  title: "blocks/Calendar",
  component: CalendarDemo,
  parameters: { layout: "centered" },
  decorators: (Story) => (
    <div className="w-[min(1100px,calc(100dvw-4rem))]">
      <Story />
    </div>
  ),
} satisfies Meta<typeof CalendarDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Month: Story = { args: { defaultRange: "monthly" } };
export const Week: Story = { args: { defaultRange: "weekly" } };
export const Day: Story = { args: { defaultRange: "daily" } };
export const ReadOnly: Story = {
  args: { defaultRange: "weekly", readOnly: true },
};
