import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Calendar, type DateRange } from "@notion-kit/shadcn";
import { DateTimePicker } from "@notion-kit/table-view";

const meta = {
  title: "Shadcn/Calendar",
  component: Calendar,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  decorators: [
    () => {
      const [date, setDate] = useState<Date | undefined>(new Date());
      return (
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow-sm"
          captionLayout="dropdown"
        />
      );
    },
  ],
};

export const RangeCalendar: Story = {
  decorators: [
    () => {
      const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(2025, 5, 12),
        to: new Date(2025, 6, 15),
      });

      return (
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          className="rounded-lg border shadow-sm"
        />
      );
    },
  ],
};

export const EnhancedDateTimePicker: Story = {
  decorators: [() => <DateTimePicker />],
};
