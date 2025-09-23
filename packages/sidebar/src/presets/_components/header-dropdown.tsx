import React from "react";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@notion-kit/shadcn";

interface HeaderDropdownProps {
  onLogout?: () => void;
  onCreateWorkspace?: () => void;
}

export function HeaderDropdown({
  onCreateWorkspace,
  onLogout,
}: HeaderDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={null} className="relative flex size-5 text-secondary">
          <Icon.Dots className="size-3 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            Icon={<Icon.SquarePlus className="size-4" />}
            Body="Join or create workspace"
            onSelect={onCreateWorkspace}
          />
          <DropdownMenuItem
            Icon={<Icon.CircleCross className="size-4" />}
            Body="Log out"
            onSelect={onLogout}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
