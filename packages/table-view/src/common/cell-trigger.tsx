import React from "react";

import { cn, cva, type VariantProps } from "@notion-kit/cn";
import { buttonVariants, TooltipPreset } from "@notion-kit/shadcn";

import type { LayoutType } from "../features";

const cellVariant = cva("relative px-2 aria-disabled:pointer-events-none", {
  variants: {
    layout: {
      table: "block min-h-9 w-full overflow-clip py-[7.5px] text-sm/normal",
      list: "min-h-[30px] flex-none overflow-hidden rounded-md",
      board: "min-h-7 w-fit flex-none overflow-hidden rounded-md px-1",
      /**
       * @todo not implemented
       */
      calendar: "",
      timeline: "",
      gallery: "",
      chart: "",
    },
    wrapped: {
      true: "whitespace-normal",
    },
    widthType: {
      checkbox: "min-w-fit",
      date: "max-w-[max(150px,16%)] min-w-25",
      number: "max-w-[max(150px,16%)] min-w-25",
      text: "max-w-[max(200px,16%)] min-w-5",
      select: "max-w-[max(200px,16%)] min-w-5",
      link: "max-w-[max(150px,16%)] min-w-5",
    },
  },
  defaultVariants: {
    layout: "table",
    widthType: null,
  },
});
type CellVariant = VariantProps<typeof cellVariant>;

interface CellTriggerProps extends React.ComponentProps<"div"> {
  wrapped?: boolean;
  layout?: LayoutType;
  widthType?: CellVariant["widthType"];
  tooltip?: {
    title: string;
    description?: string;
  };
  stopPropagation?: boolean;
}

export function CellTrigger({
  className,
  wrapped,
  layout = "table",
  widthType,
  tooltip,
  stopPropagation = true,
  ...props
}: CellTriggerProps) {
  return (
    <TooltipPreset
      side={layout === "board" ? "left" : "top"}
      {...(tooltip
        ? {
            description: tooltip.description
              ? [
                  { type: "default", text: tooltip.title },
                  { type: "secondary", text: tooltip.description },
                ]
              : tooltip.title,
          }
        : {
            description: "",
            disabled: true,
          })}
    >
      <div
        tabIndex={0}
        role="button"
        className={cn(
          buttonVariants({ variant: "cell" }),
          cellVariant({
            layout,
            wrapped,
            widthType: layout === "list" ? widthType : null,
          }),
          className,
        )}
        {...props}
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation();
          props.onClick?.(e);
        }}
        onKeyDown={(e) => {
          if (stopPropagation) e.stopPropagation();
          props.onKeyDown?.(e);
        }}
      />
    </TooltipPreset>
  );
}
