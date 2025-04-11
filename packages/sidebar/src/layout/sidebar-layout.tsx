import React from "react";

import { cn } from "@notion-kit/cn";
import { groupVariants } from "@notion-kit/shadcn";

interface SidebarProps extends React.PropsWithChildren {
  ref?: React.Ref<HTMLElement>;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  ref,
  className,
  children,
}) => {
  return (
    <aside
      ref={ref}
      data-slot="sidebar"
      className={cn(
        "group/sidebar relative z-20 flex h-screen w-60 flex-col overflow-y-auto bg-sidebar",
        className,
      )}
    >
      {children}
    </aside>
  );
};

export const SidebarHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="sidebar-header"
    className={cn("flex flex-col gap-2 p-1", className)}
    {...props}
  />
);

export const SidebarContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="sidebar-content"
    className={cn(
      "mt-4 flex min-h-0 w-full flex-1 flex-col gap-y-4 overflow-auto",
      className,
    )}
    {...props}
  />
);

export const SidebarFooter = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="sidebar-footer"
    className={cn("flex flex-col gap-2 p-1", className)}
    {...props}
  />
);

export const SidebarGroup = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="sidebar-group"
    className={cn(groupVariants({ className }))}
    {...props}
  />
);

export const SidebarInset = ({
  className,
  ...props
}: React.ComponentProps<"main">) => {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-main",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
};
