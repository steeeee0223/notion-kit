"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@notion-kit/cn";

import { contentVariants } from "./variants";

const Tabs = TabsPrimitive.Root;

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;
const TabsList = ({ className, ...props }: TabsListProps) => (
  <TabsPrimitive.List
    className={cn(
      "flex h-10 w-full items-center justify-start rounded-none border-b px-2",
      "bg-transparent text-muted dark:text-primary/45",
      className,
    )}
    {...props}
  />
);
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;
const TabsTrigger = ({ className, children, ...props }: TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      "relative inline-flex h-9 items-center justify-center bg-transparent py-1 text-sm font-medium whitespace-nowrap shadow-none transition-none",
      "text-muted dark:text-primary/45",
      "border-b-2 border-b-transparent",
      "focus-visible:outline-hidden",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:border-b-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary/80",
      className,
    )}
    {...props}
  >
    <p className="rounded-sm px-2 py-1 hover:bg-primary/5">{children}</p>
  </TabsPrimitive.Trigger>
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>;
const TabsContent = ({ className, ...props }: TabsContentProps) => (
  <TabsPrimitive.Content
    className={cn(
      "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-semibold",
      contentVariants({ variant: "tab" }),
      className,
    )}
    {...props}
  />
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
