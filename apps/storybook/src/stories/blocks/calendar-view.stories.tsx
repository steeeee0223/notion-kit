import type { Meta, StoryObj } from "storybook-react-rsbuild";

import CalendarCustomEvents from "@notion-kit/registry/calendar-custom-events";
import CalendarDay from "@notion-kit/registry/calendar-day";
import CalendarDemo from "@notion-kit/registry/calendar-demo";
import CalendarReadonly from "@notion-kit/registry/calendar-readonly";
import CalendarWeek from "@notion-kit/registry/calendar-week";

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
export const Week: Story = { render: () => <CalendarWeek /> };
export const Day: Story = { render: () => <CalendarDay /> };
export const ReadOnly: Story = { render: () => <CalendarReadonly /> };
export const CustomEvents: Story = { render: () => <CalendarCustomEvents /> };
