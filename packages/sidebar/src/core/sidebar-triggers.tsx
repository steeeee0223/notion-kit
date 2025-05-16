"use client";

import { useMemo } from "react";
import { ChevronsLeft, MenuIcon } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

import { mergeRefs } from "./merge-refs";
import { useSidebar } from "./sidebar-provider";
import { useSidebarResize } from "./use-sidebar-resize";

interface SidebarRailProps extends React.ComponentProps<"div"> {
  //* For sidebar resizing
  enableDrag?: boolean;
}

const SidebarRail: React.FC<SidebarRailProps> = ({
  ref,
  className,
  enableDrag = true,
  ...props
}) => {
  const { config, toggleSidebar, setWidth, state, width, setIsDraggingRail } =
    useSidebar();

  const { dragRef, handleMouseDown } = useSidebarResize({
    enableDrag,
    setIsDraggingRail,
    onResize: setWidth,
    onToggle: toggleSidebar,
    currentWidth: width,
    isCollapsed: state === "collapsed",
    minResizeWidth: config.minWidth,
    maxResizeWidth: config.maxWidth,
    cookieName: config.cookieName.width,
    cookieMaxAge: config.cookieMaxAge,
  });

  //* Merge external ref with our dragRef
  const combinedRef = useMemo(
    () => mergeRefs(ref ? [ref, dragRef] : [dragRef]),
    [ref, dragRef],
  );

  return (
    <div
      role="button"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      className={cn(
        "absolute top-0 right-0 h-full w-0.5 cursor-ew-resize bg-default/10 opacity-0 transition group-hover:opacity-100",
        className,
      )}
      //* For sidebar resizing
      ref={combinedRef}
      onMouseDown={handleMouseDown}
      {...props}
    />
  );
};

const SidebarClose = ({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { config, isMobile, toggleSidebar } = useSidebar();

  return (
    <TooltipPreset
      description={[
        { type: "default", text: "Close sidebar" },
        { type: "secondary", text: `⌘${config.shortcut}` },
      ]}
    >
      <Button
        data-slot="sidebar-close"
        variant="hint"
        onClick={(e) => {
          onClick?.(e);
          toggleSidebar();
        }}
        className={cn(
          "absolute top-3.5 right-3 size-6 opacity-0 transition group-hover:opacity-100",
          isMobile && "opacity-100",
          className,
        )}
        {...props}
      >
        <ChevronsLeft className="size-4" />
      </Button>
    </TooltipPreset>
  );
};

const SidebarOpen = ({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { config, toggleSidebar } = useSidebar();

  return (
    <TooltipPreset
      description={[
        { type: "default", text: "Close sidebar" },
        { type: "secondary", text: `⌘${config.shortcut}` },
      ]}
      side="right"
      align="start"
    >
      <Button
        variant="hint"
        onClick={(e) => {
          onClick?.(e);
          toggleSidebar();
        }}
        className={cn("size-6 p-0 transition", className)}
        {...props}
      >
        <MenuIcon className="size-4" />
      </Button>
    </TooltipPreset>
  );
};

export { SidebarRail, SidebarClose, SidebarOpen };
