import React from "react";
import { MoreHorizontal, PlusSquare, XCircle } from "lucide-react";

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

export const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  onCreateWorkspace,
  onLogout,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={null} className="relative flex size-5 text-secondary">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            Icon={<PlusSquare className="size-4 text-icon" />}
            Body="Join or create workspace"
            onSelect={onCreateWorkspace}
          />
          <DropdownMenuItem
            Icon={<XCircle className="size-4 text-icon" />}
            Body="Log out"
            onSelect={onLogout}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
