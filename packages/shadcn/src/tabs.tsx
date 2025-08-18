"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@notion-kit/cn";

import { contentVariants } from "./variants";

function Tabs({ ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex h-10 w-full items-center justify-start rounded-none border-b px-2",
        "bg-transparent text-muted dark:text-default/45",
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
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-9 items-center justify-center bg-transparent py-1 text-sm font-medium whitespace-nowrap shadow-none transition-none",
        "text-muted dark:text-default/45",
        "border-b-2 border-b-transparent",
        "focus-visible:outline-hidden",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:border-b-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <p className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-default/5">
        {children}
      </p>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-semibold",
        contentVariants({ variant: "tab", sideAnimation: true }),
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
