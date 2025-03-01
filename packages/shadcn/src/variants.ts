import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex animate-bg-in cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-sm text-sm font-normal hover:bg-primary/5 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border border-border-button",
        secondary: "border border-border-button text-icon dark:text-icon-dark",
        nav: "text-icon dark:text-icon-dark",
        item: "relative flex justify-normal text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-primary/80",
        subitem: "relative flex text-secondary dark:text-secondary-dark",
        link: "text-primary underline-offset-4 hover:bg-transparent hover:underline dark:text-icon-dark dark:text-primary/80",
        blue: "border border-border bg-blue font-medium text-white shadow-sm hover:bg-blue-hover hover:text-white disabled:bg-blue",
        "soft-blue":
          "bg-blue/5 text-blue shadow-sm hover:bg-blue/15 disabled:bg-blue/5",
        hint: "font-medium text-muted dark:text-muted-dark",
        red: "border border-red/50 text-red hover:bg-red/10 focus:bg-red/10",
        "red:fill":
          "bg-red text-white hover:bg-red/65 disabled:bg-red dark:hover:bg-red/35",
        white: "border border-white text-white",
        /**
         * For close icon only
         */
        close:
          "flex size-[18px] shrink-0 rounded-full bg-primary/5 hover:bg-primary/15 dark:hover:bg-primary/0",
      },
      size: {
        xs: "h-6 px-1.5 text-xs",
        sm: "h-8 px-3",
        md: "h-9 px-4 py-2",
        lg: "h-10 rounded-md px-8",
        icon: "size-9 rounded-md",
        "icon-sm": "size-5",
        "icon-md": "size-7",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;

/** @version 1.5 */
export const menuItemVariants = cva(
  [
    "mx-1 flex min-h-7 w-[calc(100%-8px)] animate-bg-in cursor-pointer select-none items-center rounded-md px-2 text-sm/[1.2] text-primary hover:bg-primary/5 focus-visible:outline-none dark:text-primary/80",
    "[&_svg]:block [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        secondary: "text-secondary dark:text-secondary-dark",
        warning: "hover:text-red",
        error: "text-red",
      },
      inset: { true: "pl-8" },
      disabled: {
        true: "pointer-events-none cursor-not-allowed opacity-50 hover:bg-transparent",
      },
    },
    defaultVariants: {},
  },
);
export type MenuItemVariants = VariantProps<typeof menuItemVariants>;

/** @version 1.5 */
export const inputVariants = cva(
  "relative flex h-7 w-full cursor-text items-center rounded-md bg-input/60 px-1.5 py-[3px] text-sm text-primary transition-colors dark:bg-input/5 dark:text-primary/80 [&_input]:block [&_input]:w-full [&_input]:bg-transparent [&_input]:p-0 [&_input]:text-inherit",
  {
    variants: {
      variant: {
        default:
          "ring-1 ring-inset ring-ring focus-within:notion-focus-within dark:ring-ring-dark",
        /**
         * default style but not focusable
         */
        plain: "ring-1 ring-inset ring-ring dark:ring-ring-dark",
        /**
         * transparent and without border
         */
        flat: "bg-transparent dark:bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export type InputVariants = VariantProps<typeof inputVariants>;

export const contentVariants = cva(
  "border border-border focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        modal:
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-modal p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        popover:
          "z-50 rounded-md bg-popover shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        tab: "border-none bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        tooltip:
          "relative z-50 overflow-hidden border-none bg-tooltip font-medium text-white/90 shadow-md backdrop-filter-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:text-primary/80",
        shadcn: "text-popover-foreground bg-popover shadow-md",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export type ContentVariants = VariantProps<typeof contentVariants>;

export const separatorVariants = cva("-mx-1 my-1 h-px", {
  variants: {
    variant: {
      default: "bg-primary/10",
      shadcn: "bg-muted",
    },
  },
  defaultVariants: { variant: "default" },
});
export type SeparatorVariants = VariantProps<typeof separatorVariants>;

export const groupVariants = cva("flex flex-col gap-px py-1");
