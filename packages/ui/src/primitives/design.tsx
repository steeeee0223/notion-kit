import { cn, cva, type VariantProps } from "@notion-kit/cn";

export const positioner = cva("isolate z-(--z-menu) outline-none");

/**
 * fits with base-ui's design system
 */
const popupVariants = cva(
  [
    cn(
      "z-(--z-menu) duration-100",
      "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
      "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
    ),
  ],
  {
    variants: {
      color: {
        popup:
          "rounded-lg border border-border bg-popover text-primary shadow-md outline-none",
        tooltip: "rounded-sm bg-tooltip text-tooltip-primary",
        aside: "bg-main text-primary shadow-lg",
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
        /**
         * @variation
         * - color: `popup`
         * - position: `transform`
         * - layout: `null`
         */
        popover: cn(
          "w-72 overflow-hidden",
          // "flex w-72 flex-col gap-2.5 p-2.5 text-sm"
        ),
        /**
         * @variation
         * - color: `popup`
         * - position: `transform`
         * - layout: `list`
         */
        select: cn(
          "relative isolate min-w-36 data-[align-trigger=true]:animate-none",
        ),
        /**
         * @variation
         * - color: `popup`
         * - position: `transform`
         * - layout: `list`
         */
        dropdownMenu: cn("min-w-32 data-closed:overflow-hidden"),
        /**
         * @variation
         * - color: `popup`
         * - position: `transform`
         * - layout: `list`
         */
        contextMenu: cn("min-w-36"),
        /**
         * @variation
         * - color: `popup`
         * - position: `transform`
         * - layout: `list`
         */
        autocomplete: cn(
          "group/autocomplete-content max-h-[min(calc(var(--available-height)-8px),300px)] min-w-(--anchor-width)",
        ),
        /**
         * @variation
         * - color: `popup`
         * - position: `transform`
         * - layout: `list`
         */
        combobox: cn(
          "group/combobox-content relative max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] data-[chips=true]:min-w-(--anchor-width)",
          // "*:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none",
        ),
        /**
         * @variation
         * - color: `popup`
         * - position: `centered`
         * - layout: `fullscreen`
         */
        dialog: cn("grid gap-4 rounded-xl p-4 text-sm"),
        /**
         * @variation
         * - color: `aside`
         * - position: `null`
         * - layout: `null`
         */
        sheet: cn(
          "fixed bg-clip-padding transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:-translate-y-10 data-[side=top]:data-starting-style:-translate-y-10",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:data-starting-style:translate-y-10",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-10 data-[side=right]:data-starting-style:translate-x-10 data-[side=right]:sm:max-w-sm",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:-translate-x-10 data-[side=left]:data-starting-style:-translate-x-10 data-[side=left]:sm:max-w-sm",
        ),
        /**
         * @variation
         * - color: `tooltip`
         * - position: `transform`
         * - layout: `null`
         */
        tooltip: cn(
          "inline-flex w-fit max-w-55 items-center gap-1.5 rounded-sm px-2 py-1 text-xs/[1.4] font-medium wrap-break-word",
          "has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
        ),
      },
    },
  },
);
type PopupVariants = VariantProps<typeof popupVariants>;

export function popup({ type }: { type: PopupVariants["type"] }) {
  switch (type) {
    case "popover":
      return popupVariants({
        type,
        color: "popup",
        position: "transform",
        layout: null,
      });
    case "autocomplete":
    case "combobox":
    case "contextMenu":
    case "dropdownMenu":
    case "select":
      return popupVariants({
        type,
        color: "popup",
        position: "transform",
        layout: "list",
      });
    case "sheet":
      return popupVariants({
        type,
        color: "aside",
        position: null,
        layout: null,
      });
    case "dialog":
      return popupVariants({
        type,
        color: "popup",
        position: "centered",
        layout: "fullscreen",
      });
    case "tooltip":
      return popupVariants({
        type,
        color: "tooltip",
        position: "transform",
        layout: null,
      });
    default:
      return popupVariants();
  }
}
