import React, { useMemo } from "react";

import { cn } from "@notion-kit/cn";
import { MenuItem, TooltipPreset } from "@notion-kit/shadcn";

interface SidebarMenuItemProps extends React.ComponentProps<"div"> {
  label: React.ReactNode;
  hint?: string;
  shortcut?: string;
  icon?: React.ReactNode;
}

export function SidebarMenuItem({
  hint,
  shortcut,
  ...props
}: SidebarMenuItemProps) {
  const item = useMemo(() => {
    const { className, label, icon, ...rest } = props;
    return (
      <MenuItem
        data-slot="sidebar-menuitem"
        variant="sidebar"
        className={cn("h-[27px] font-medium", className)}
        Body={label}
        Icon={icon}
        {...rest}
      />
    );
  }, [props]);

  if (!hint) return item;
  return (
    <TooltipPreset
      description={
        shortcut
          ? [
              { type: "default", text: hint },
              { type: "secondary", text: shortcut },
            ]
          : hint
      }
      side="right"
      sideOffset={8}
    >
      {item}
    </TooltipPreset>
  );
}
