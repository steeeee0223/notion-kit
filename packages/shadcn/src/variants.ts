import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex animate-bg-in cursor-pointer items-center justify-center rounded-sm text-sm font-normal whitespace-nowrap select-none hover:bg-primary/5 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border border-border-button",
        icon: "size-9 rounded-md border border-border-button text-icon",
        "nav-icon": "size-7 text-icon",
        link: "text-primary underline-offset-4 hover:bg-transparent hover:underline dark:text-primary/80",
        blue: "border border-border bg-blue font-medium text-white shadow-xs hover:bg-blue-hover hover:text-white disabled:bg-blue",
        "soft-blue":
          "bg-blue/5 text-blue shadow-xs hover:bg-blue/15 disabled:bg-blue/5",
        hint: "font-medium text-muted",
        red: "border border-red/50 text-red hover:bg-red/10 focus:bg-red/10",
        "red-fill":
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
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;

export const menuItemVariants = cva(
  [
    "mx-1 flex min-h-7 w-[calc(100%-8px)] animate-bg-in cursor-pointer items-center rounded-md px-2 text-sm/[1.2] select-none hover:bg-primary/5 focus-visible:outline-hidden",
    "[&_svg]:block [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "text-primary dark:text-primary/80",
        secondary: "text-secondary",
        sidebar: "text-sidebar-primary",
        warning: "hover:text-red",
        error: "text-red",
      },
      inset: { true: "pl-8" },
      disabled: {
        true: "pointer-events-none cursor-not-allowed opacity-50 hover:bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
export type MenuItemVariants = VariantProps<typeof menuItemVariants>;

export const inputVariants = cva(
  "relative flex h-7 w-full cursor-text items-center rounded-md bg-input/60 px-1.5 py-[3px] text-sm text-primary transition-colors dark:bg-input/5 dark:text-primary/80 [&_input]:block [&_input]:w-full [&_input]:bg-transparent [&_input]:p-0 [&_input]:text-inherit",
  {
    variants: {
      variant: {
        default: "ring-1 ring-ring ring-inset focus-within:notion-focus-within",
        /**
         * default style but not focusable
         */
        plain: "ring-1 ring-ring ring-inset",
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
  "border border-border focus-visible:outline-hidden",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        modal:
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-modal p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=open]:zoom-in-95",
        popover:
          "z-50 rounded-md bg-popover shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        tab: "border-none bg-popover data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        tooltip:
          "relative z-50 animate-in overflow-hidden border-none bg-tooltip font-medium text-tooltip-primary shadow-md backdrop-filter-none fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export type ContentVariants = VariantProps<typeof contentVariants>;

export const separatorVariants = cva("-mx-1 my-1 h-px bg-primary/10");
export type SeparatorVariants = VariantProps<typeof separatorVariants>;

export const groupVariants = cva("flex flex-col gap-px py-1");
