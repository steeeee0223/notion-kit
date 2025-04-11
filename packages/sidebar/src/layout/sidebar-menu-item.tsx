import React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Hint, MenuItem, type HintProps } from "@notion-kit/common";

interface SidebarMenuItemProps {
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
  label: string;
  description: HintProps["description"];
  icon: LucideIcon;
  onClick?: () => void;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  ref,
  className,
  label,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <Hint description={description} side="right" sideOffset={8}>
      <MenuItem
        data-slot="sidebar-menuitem"
        ref={ref}
        variant="secondary"
        onClick={onClick}
        className={cn("h-[27px] font-medium", className)}
        Icon={<Icon className="size-5 rounded-sm p-0.5 text-muted" />}
        Body={label}
      />
    </Hint>
  );
};
