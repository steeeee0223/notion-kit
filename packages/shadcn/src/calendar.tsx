"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@notion-kit/cn";

import { Button } from "./button";
import * as Icon from "./icons";
import { buttonVariants } from "./variants";

const rotation = cva("", {
  variants: {
    orientation: {
      down: "rotate-0",
      up: "rotate-180",
      left: "rotate-90",
      right: "-rotate-90",
    },
  },
});

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      fixedWeeks={fixedWeeks}
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn(
        "group/calendar bg-transparent p-3",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        // css variables
        "[--caption-height:--spacing(7)] [--cell-size:--spacing(8)]",
        className,
      )}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        ...defaultClassNames,
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-end gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: "hint" }),
          "size-6 aria-disabled:opacity-40",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "hint" }),
          "size-6 aria-disabled:opacity-40",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-(--caption-height) w-full items-center justify-start",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--caption-height) w-full items-center justify-start gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "pl-2 text-sm font-medium select-none",
          captionLayout === "label"
            ? "leading-6"
            : "flex h-(--caption-height) items-center gap-1 rounded-md pr-1 [&>svg]:size-3.5 [&>svg]:text-muted",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-md text-[0.8rem] font-normal text-muted select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "text-[0.8rem] text-muted select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day,
        ),
        today: cn(
          "rounded-full bg-red text-white data-[selected=true]:rounded-md data-[selected=true]:bg-inherit",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted aria-selected:text-muted",
          defaultClassNames.outside,
        ),
        disabled: cn("text-muted", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          return (
            <Icon.ChevronDown
              className={cn(rotation({ orientation, className }))}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant={null}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col [&>span]:text-xs [&>span]:opacity-70",
        // hover
        "hover:border-2 hover:border-blue hover:bg-blue/15",
        // range start styles
        "data-[range-start=true]:rounded-md data-[range-start=true]:bg-blue/45",
        // range middle styles
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-blue/15 data-[range-middle=true]:hover:rounded-md",
        // range end styles
        "data-[range-end=true]:rounded-md data-[range-end=true]:bg-blue data-[range-end=true]:text-white data-[range-end=true]:hover:rounded-md",
        // selected single day styles
        "data-[selected-single=true]:bg-blue data-[selected-single=true]:text-white",
        // group focus styles
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:shadow-notion",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
export type { DateRange } from "react-day-picker";
