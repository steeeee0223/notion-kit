import { cn, cva } from "@notion-kit/cn";

/**
 * @todo update contentVariant based on this
 */
export const content = cva(
  [
    cn(
      "z-50 duration-100",
      "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
      "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
    ),
  ],
  {
    variants: {
      color: {
        popup:
          "text-popover-foreground ring-foreground/10 rounded-lg bg-popover shadow-md ring-1 outline-none",
        tooltip: "bg-foreground text-background",
      },
      position: {
        transform: cn(
          "origin-(--transform-origin)",
          "data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
        ),
        centered: "fixed top-1/2 left-1/2 -translate-1/2",
      },
      layout: {
        list: "max-h-(--available-height) w-(--anchor-width) overflow-x-hidden overflow-y-auto",
        fullscreen: "w-full max-w-[calc(100%-2rem)] sm:max-w-sm",
      },
      type: {
        // color: popup, position: transform, layout: null
        popover: cn("flex w-72 flex-col gap-2.5 p-2.5 text-sm"),
        // color: popup, position: transform, layout: list
        select: cn(
          "relative isolate min-w-36 data-[align-trigger=true]:animate-none",
        ),
        // color: popup, position: transform,layout: list
        dropdownMenu: cn("min-w-32 p-1 data-closed:overflow-hidden"),
        // color: popup, position: transform,layout: list
        contextMenu: cn("min-w-36 p-1"),
        // color: popup, position: transform, layout: list
        combobox: cn(
          "group/combobox-content relative max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] data-[chips=true]:min-w-(--anchor-width)",
          "*:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none",
        ),
        // color: popup, position: centered, layout: fullscreen
        dialog: cn("grid gap-4 rounded-xl p-4 text-sm"),
        // color: tooltip, position: transform, layout: null
        tooltip: cn(
          "inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md px-3 py-1.5 text-xs",
          "has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
        ),
      },
    },
  },
);
