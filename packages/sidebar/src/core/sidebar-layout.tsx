import React from "react";

import { cn } from "@notion-kit/cn";
import { MenuGroup } from "@notion-kit/shadcn";

const SidebarHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="sidebar-header"
    className={cn("flex flex-col gap-2 p-1", className)}
    {...props}
  />
);

const SidebarContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="sidebar-content"
    className={cn(
      "mt-4 flex min-h-0 w-full flex-1 flex-col gap-y-4 overflow-auto px-1",
      className,
    )}
    {...props}
  />
);

const SidebarFooter = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="sidebar-footer"
    className={cn("flex flex-col gap-2 p-1", className)}
    {...props}
  />
);

const SidebarGroup = (props: React.ComponentProps<"div">) => (
  <MenuGroup data-slot="sidebar-group" {...props} />
);

const SidebarInset = ({
  className,
  ...props
}: React.ComponentProps<"main">) => (
  <main
    className={cn("relative flex min-h-svh flex-1 flex-col bg-main", className)}
    {...props}
  />
);

export {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarInset,
};
