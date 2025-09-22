import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const typographyVariants = cva("", {
  variants: {
    type: {
      /**
       * @prop h2
       * @note tx-heading-17-semi
       */
      h2: "text-lg/[22px] font-semibold",
      /**
       * @prop h3
       * @note tx-uiregular-14-semi
       */
      h3: "text-sm/5 font-semibold",
      /**
       * @prop body
       * @note tx-body-14-reg
       */
      body: "text-sm/5 font-normal",
      label: "text-xs/4.5 font-medium",
      desc: "text-xs/4",
    },
  },
});
export type Typography = VariantProps<typeof typographyVariants>["type"];
export const typography = (type: Typography) => typographyVariants({ type });

export const buttonVariants = cva(
  [
    "inline-flex animate-bg-in cursor-pointer items-center justify-center gap-1.5 rounded-sm text-sm font-normal whitespace-nowrap select-none",
    "hover:bg-default/5 focus-visible:outline-hidden",
    "disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-40",
    "[&_svg]:block [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: "border border-border-button fill-primary text-primary",
        icon: "size-9 rounded-md border border-border-button text-icon",
        "nav-icon": "size-7 text-icon",
        link: "text-primary underline-offset-4 hover:bg-transparent hover:underline",
        blue: "border border-border bg-blue font-medium text-white shadow-xs hover:bg-blue-hover hover:text-white disabled:bg-blue/40",
        "soft-blue":
          "bg-blue/5 text-blue shadow-xs hover:bg-blue/15 disabled:bg-blue/5",
        hint: "font-medium text-muted",
        red: "border border-red/50 text-red hover:bg-red/10 focus:bg-red/10",
        "red-fill":
          "bg-red text-white hover:bg-red/65 disabled:bg-red dark:hover:bg-red/35",
        white: "border border-white text-white",
        cell: "flex justify-normal rounded-none",
        /**
         * For close icon only
         */
        close:
          "flex size-[18px] shrink-0 rounded-full bg-default/5 hover:bg-default/15 dark:hover:bg-default/0",
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
    "mx-1 flex min-h-7 w-[calc(100%-8px)] animate-bg-in cursor-pointer items-center rounded-md px-2 text-sm/[1.2] select-none hover:bg-default/5 focus-visible:outline-hidden",
    "fill-menu-icon [&_svg]:block [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        sidebar: "fill-secondary text-sidebar-primary",
        warning: "hover:fill-red hover:text-red",
        error: "fill-red text-red",
      },
      inset: { true: "pl-8" },
      disabled: {
        true: "pointer-events-none cursor-not-allowed opacity-40 hover:bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
export type MenuItemVariants = VariantProps<typeof menuItemVariants>;

export const inputVariants = cva(
  [
    "relative flex w-full cursor-text items-center rounded-md bg-input text-primary transition-colors",
    "[&_input]:block [&_input]:w-full [&_input]:bg-transparent [&_input]:p-0 [&_input]:text-inherit",
  ],
  {
    variants: {
      variant: {
        default: "ring-1 ring-ring ring-inset focus-within:shadow-notion",
        /**
         * default style but not focusable
         */
        plain: "ring-1 ring-ring ring-inset",
        /**
         * transparent and without border
         */
        flat: "bg-transparent",
      },
      size: {
        default: "h-7 px-1.5 text-sm",
        lg: "h-[34px] px-2.5 text-[15px]/[26px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export type InputVariants = VariantProps<typeof inputVariants>;

export const contentVariants = cva(
  "border border-border focus-visible:outline-hidden",
  {
    variants: {
      variant: {
        /**
         * @prop default
         * @note Used by: Drawer
         */
        default: "bg-transparent",
        /**
         * @prop modal
         * @note Used by: Dialog
         * @note Used with: `openAnimation`
         */
        modal:
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-modal p-6 shadow-lg duration-200",
        /**
         * @prop popover
         * @note Used by: DropdownMenu, Popover, Select
         * @note Used with: `openAnimation`, `sideAnimation`
         */
        popover: "z-50 rounded-md bg-popover shadow-md",
        /**
         * @prop tab
         * @note Used by: Tabs
         * @note Used with: `openAnimation`, `sideAnimation`
         */
        tab: "border-none bg-transparent",
        /**
         * @prop tooltip
         * @note Used by: Tooltip
         * @note Used with: `openAnimation`, `sideAnimation`
         */
        tooltip:
          "relative z-50 animate-in overflow-hidden border-none bg-tooltip font-medium text-tooltip-primary shadow-md backdrop-filter-none fade-in-0 zoom-in-95",
      },
      openAnimation: {
        true: [
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        ],
      },
      sideAnimation: {
        true: "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      },
    },
    defaultVariants: { variant: "default", openAnimation: true },
  },
);
export type ContentVariants = VariantProps<typeof contentVariants>;

export const separatorVariants = cva("-mx-1 my-1 h-px bg-default/10");
export type SeparatorVariants = VariantProps<typeof separatorVariants>;

export const groupVariants = cva("flex flex-col gap-px py-1");
