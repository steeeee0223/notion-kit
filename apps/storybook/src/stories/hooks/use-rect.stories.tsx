import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { cn } from "@notion-kit/cn";
import { useRect } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";

import { Code } from "@/components/code";

const meta = {
  title: "Hooks/Use Rect",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    () => {
      const { ref, rect } = useRect();
      const [expanded, setExpanded] = useState(false);

      return (
        <div className="flex w-80 flex-col gap-4">
          <div
            ref={ref}
            className={cn(
              "flex h-30 w-full items-center justify-center rounded-md border-2 border-blue bg-blue/15 transition-[height]",
              expanded && "h-60",
            )}
            onPointerDown={() => setExpanded((v) => !v)}
          >
            <Icon.Chevron
              side={expanded ? "down" : "right"}
              className="size-8 fill-primary transition-[rotate]"
            />
          </div>
          <Code codeObject={rect} />
        </div>
      );
    },
  ],
};
