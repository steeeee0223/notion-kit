import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Label, Switch } from "@notion-kit/shadcn";
import { DateRangeInput, type DateData } from "@notion-kit/table-view";

const meta = {
  title: "blocks/Date Range Input",
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    () => {
      const [data, setData] = useState<DateData>({
        start: Date.now(),
        end: Date.now() + 86400000,
      });

      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <DateRangeInput className="w-60" value={data} onChange={setData} />
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-2">
              <Switch
                checked={data.endDate}
                onCheckedChange={() =>
                  setData((v) => ({ ...v, endDate: !v.endDate }))
                }
              />
              Show end
            </Label>
            <Label className="flex items-center gap-2">
              <Switch
                checked={data.includeTime}
                onCheckedChange={() =>
                  setData((v) => ({ ...v, includeTime: !v.includeTime }))
                }
              />
              Show time
            </Label>
          </div>
        </div>
      );
    },
  ],
};
