import React, { useMemo } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { MenuItem } from "@notion-kit/ui/primitives";

const permissions = [
  {
    value: "default",
    label: "Default",
    icon: <Icon.Globe className="size-5" />,
    desc: "",
  },
  {
    value: "open",
    label: "Open",
    icon: <Icon.Teamspace className="size-5" />,
    desc: "Anyone can see and join this teamspace",
  },
  {
    value: "closed",
    label: "Closed",
    icon: <Icon.People className="size-5" />,
    desc: "Anyone can see this teamspace but not join",
  },
  {
    value: "private",
    label: "Private",
    icon: <Icon.Lock className="size-5" />,
    desc: "Only members can see that this teamspace exists",
  },
];

export function useTeamspacePermissionOptions(workspace: string) {
  return useMemo(
    () =>
      permissions.map((permission) => {
        if (permission.value !== "default") return permission;
        return {
          ...permission,
          desc: `Everyone at ${workspace} must be a member`,
        };
      }),
    [workspace],
  );
}

export function TeamspacePermission({
  className,
  ...props
}: React.ComponentProps<typeof MenuItem>) {
  return <MenuItem className={cn("h-10 w-full", className)} {...props} />;
}
