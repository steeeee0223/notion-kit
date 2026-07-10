import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@notion-kit/cn";

interface TabsProps<TabValue = string> extends TabsPrimitive.Root.Props {
  defaultValue?: TabValue;
  value?: TabValue;
  onValueChange?: (value: TabValue) => void;
}

function Tabs<TabValue = string>({ ...props }: TabsProps<TabValue>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex h-10 w-full items-center justify-start rounded-none px-2",
        "bg-transparent text-muted dark:text-default/45",
        "data-[orientation=horizontal]:border-b",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-9 items-center justify-center bg-transparent py-1 text-sm font-medium whitespace-nowrap shadow-none transition-none",
        "text-muted dark:text-default/45",
        "focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50",
        "data-active:text-primary dark:data-active:text-primary",
        "data-[orientation=horizontal]:data-active:border-b-2 data-[orientation=horizontal]:data-active:border-b-primary",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <p className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-default/5">
        {children}
      </p>
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
