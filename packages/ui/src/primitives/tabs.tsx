import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn, cva, type VariantProps } from "@notion-kit/cn";

interface TabsProps<TabValue = string> extends TabsPrimitive.Root.Props {
  defaultValue?: TabValue;
  value?: TabValue;
  onValueChange?: (value: TabValue) => void;
}

function Tabs<TabValue = string>({ ...props }: TabsProps<TabValue>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

export type TabsVariant = "line" | "segmented";
const TabsVariantContext = React.createContext<TabsVariant>("line");

const tabsListVariants = cva(
  [
    "flex h-10 w-full items-center justify-start rounded-none px-2",
    "bg-transparent text-muted dark:text-default/45",
    "data-[orientation=horizontal]:border-b",
  ],
  {
    variants: {
      variant: {
        line: "",
        /** A pill-in-track look, e.g. for switching a page's density or range. */
        segmented:
          "h-9 w-fit gap-0.5 rounded-lg border-none bg-default/5 p-1 data-[orientation=horizontal]:border-none",
      },
    },
    defaultVariants: { variant: "line" },
  },
);

interface TabsListProps
  extends TabsPrimitive.List.Props,
    VariantProps<typeof tabsListVariants> {}

function TabsList({ className, variant = "line", ...props }: TabsListProps) {
  return (
    <TabsVariantContext.Provider value={variant ?? "line"}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant, className }))}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

const tabsTriggerVariants = cva(
  [
    "relative inline-flex h-9 items-center justify-center bg-transparent py-1 text-sm font-medium whitespace-nowrap shadow-none transition-none",
    "text-muted dark:text-default/45",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        line: [
          "data-active:text-primary dark:data-active:text-primary",
          "data-[orientation=horizontal]:data-active:border-b-2 data-[orientation=horizontal]:data-active:border-b-primary",
        ],
        segmented: [
          "h-7 flex-1 rounded-md px-3",
          "data-active:bg-main data-active:text-primary data-active:shadow-xs dark:data-active:bg-default/15 dark:data-active:text-primary",
        ],
      },
    },
    defaultVariants: { variant: "line" },
  },
);

const tabsTriggerInnerVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm",
  {
    variants: {
      variant: {
        line: "px-2 py-1 hover:bg-default/5",
        segmented: "",
      },
    },
    defaultVariants: { variant: "line" },
  },
);

function TabsTrigger({
  className,
  children,
  ...props
}: TabsPrimitive.Tab.Props) {
  const variant = React.useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      data-variant={variant}
      className={cn(tabsTriggerVariants({ variant, className }))}
      {...props}
    >
      <p className={cn(tabsTriggerInnerVariants({ variant }))}>{children}</p>
    </TabsPrimitive.Tab>
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
