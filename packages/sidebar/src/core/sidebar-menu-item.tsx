import React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { MenuItem, TooltipPreset } from "@notion-kit/shadcn";

interface SidebarMenuItemProps extends React.ComponentProps<"div"> {
  label: string;
  hint: string;
  shortcut?: string;
  icon: LucideIcon;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  className,
  label,
  hint,
  shortcut,
  icon: Icon,
  ...props
}) => {
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
      <MenuItem
        data-slot="sidebar-menuitem"
        variant="sidebar"
        className={cn("h-[27px] font-medium", className)}
        Icon={<Icon className="size-5 text-muted" />}
        Body={label}
        {...props}
      />
    </TooltipPreset>
  );
};
