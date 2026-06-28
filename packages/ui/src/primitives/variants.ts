import { cva, type VariantProps } from "@notion-kit/cn";

const typographyVariants = cva("", {
  variants: {
    type: {
      h1: "text-[40px]/tight font-bold",
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
    "mx-1 flex min-h-7 w-[calc(100%-8px)] animate-bg-in cursor-pointer items-center rounded-md px-2 text-sm/tight select-none hover:bg-default/5 focus-visible:outline-hidden",
    "fill-menu-icon [&_svg]:block [&_svg]:shrink-0",
    "data-highlighted:bg-default/10",
    "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "fill-secondary text-secondary",
        sidebar:
          "fill-secondary text-sidebar-primary aria-selected:bg-default/10 aria-selected:text-primary",
        warning: "hover:fill-red hover:text-red",
        error: "fill-red text-red",
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
        default: [
          "ring-1 ring-ring ring-inset focus-within:shadow-notion",
          "has-[input[aria-invalid='true']]:bg-red/15 has-[input[aria-invalid='true']]:ring-2 has-[input[aria-invalid='true']]:ring-red",
        ],
        /**
         * default style but not focusable
         */
        plain: [
          "ring-1 ring-ring ring-inset",
          "has-[input[aria-invalid='true']]:bg-red/15 has-[input[aria-invalid='true']]:ring-2 has-[input[aria-invalid='true']]:ring-red",
        ],
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

/**
 * @todo migrate to the new styles in `./design`
 */
export const contentVariants = cva(
  "border border-border text-primary focus-visible:outline-hidden",
  {
    variants: {
      variant: {
        /**
         * @prop default
         * @note Used by: Drawer
         */
        default: "bg-transparent",
        /**
         * @prop tab
         * @note Used by: Tabs
         * @note Used with: `openAnimation`, `sideAnimation`
         */
        tab: "border-none bg-transparent",
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

export const groupVariants = cva("flex flex-col gap-px py-1");
