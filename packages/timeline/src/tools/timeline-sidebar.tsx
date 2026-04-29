import React from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button, ScrollArea, TooltipPreset } from "@notion-kit/shadcn";

export interface TimelineSidebarProps extends React.PropsWithChildren {
  className?: string;
  style?: React.CSSProperties;
}

export function TimelineSidebar({
  className,
  style,
  children,
}: TimelineSidebarProps) {
  return (
    <div
      data-slot="timeline-sidebar"
      className={cn(
        "sticky inset-s-0 z-30 col-start-1 row-start-1 h-full w-(--timeline-sidebar-width)",
        className,
      )}
      style={style}
    >
      <div
        dir="ltr"
        className="box-border h-full w-(--timeline-sidebar-width) border-e border-e-border bg-main whitespace-nowrap shadow-sm [clip-path:polygon(0%_0%,120%_0%,120%_100%,0%_100%)]"
      >
        <div className="absolute z-990 w-full" />
        <div className="pointer-events-none mt-0 h-0" />
        <div className="contain-layout">{children}</div>
        <div className="pointer-events-none clear-both mt-0 h-0 translate-y-0" />
        <div className="absolute z-990 w-full -translate-y-17" />
      </div>
    </div>
  );
}

export function TimelineSidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-sidebar-header"
      className={cn(
        "sticky top-0 z-870 box-border shrink-0 bg-main",
        className,
      )}
      {...props}
    />
  );
}

export function TimelineSidebarBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div {...props} />
    </ScrollArea>
  );
}

export interface TimelineSidebarTriggerProps {
  description?: string;
  onClick?: () => void;
}

export function TimelineSidebarTrigger({
  description = "Show table",
  onClick,
}: TimelineSidebarTriggerProps) {
  return (
    <TooltipPreset side="top" description={description}>
      <Button variant="hint" size="xs" onClick={onClick}>
        <Icon.ArrowChevronDoubleSmall side="right" className="fill-icon" />
      </Button>
    </TooltipPreset>
  );
}

export interface TimelineSidebarCloseProps {
  description?: string;
  onClick?: () => void;
}

export function TimelineSidebarClose({
  description = "Hide table",
  onClick,
}: TimelineSidebarCloseProps) {
  return (
    <TooltipPreset side="top" description={description}>
      <Button
        variant="hint"
        size="xs"
        aria-label={description}
        className="absolute inset-e-2 top-2 z-840"
        onClick={onClick}
      >
        <Icon.ArrowChevronDoubleSmall side="left" className="fill-icon" />
      </Button>
    </TooltipPreset>
  );
}
