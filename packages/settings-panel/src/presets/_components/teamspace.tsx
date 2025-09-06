import React from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { MenuItem } from "@notion-kit/shadcn";

export const permissions = {
  default: {
    label: "Default",
    icon: <Icon.Globe className="size-5" />,
    description: "",
    getDescription: (workspace: string) =>
      `Everyone at ${workspace} must be a member`,
  },
  open: {
    label: "Open",
    icon: <Icon.Teamspace className="size-5" />,
    description: "Anyone can see and join this teamspace",
  },
  closed: {
    label: "Closed",
    icon: <Icon.People className="size-5" />,
    description: "Anyone can see this teamspace but not join",
  },
  private: {
    label: "Private",
    icon: <Icon.Lock className="size-5" />,
    description: "Only members can see that this teamspace exists",
  },
};

interface TeamspacePermissionProps extends React.PropsWithChildren {
  className?: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export function TeamspacePermission({
  className,
  label,
  description,
  icon,
  children,
}: TeamspacePermissionProps) {
  return (
    <MenuItem
      className={cn("h-10 w-full", className)}
      Icon={icon}
      Body={
        <div className="flex flex-col items-start gap-0.5 p-1">
          <div className="truncate">{label}</div>
          <div className="truncate text-xs text-secondary">{description}</div>
        </div>
      }
    >
      {children}
    </MenuItem>
  );
}
