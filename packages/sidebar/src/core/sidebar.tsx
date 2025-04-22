"use client";

import * as React from "react";

import { cn } from "@notion-kit/cn";
import { Sheet, SheetContent } from "@notion-kit/shadcn";

import { useSidebar } from "./sidebar-provider";

interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating";
  collapsible?: "offcanvas" | "none";
}

const Sidebar: React.FC<SidebarProps> = ({
  ref,
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) => {
  const { config, isMobile, state, openMobile, setOpenMobile, isDraggingRail } =
    useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-primary",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-primary [&>button]:hidden"
          style={
            {
              "--sidebar-width": config.defaultMobileWidth,
            } as React.CSSProperties
          }
          side={side}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={ref}
      className="group peer hidden text-sidebar-primary md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      //* For sidebar resizing
      data-dragging={isDraggingRail}
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          "relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          // Set duration to 0 for all elements when dragging
          "group-data-[dragging=true]_*:!duration-0 group-data-[dragging=true]:!duration-0",
        )}
      />
      <div
        data-slot="sidebar"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating"
            ? "p-2"
            : "group-data-[side=left]:border-r group-data-[side=right]:border-l",
          // Set duration to 0 for all elements when dragging
          "group-data-[dragging=true]_*:!duration-0 group-data-[dragging=true]:!duration-0",
          className,
        )}
        {...props}
      >
        <div className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-primary group-data-[variant=floating]:shadow">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
