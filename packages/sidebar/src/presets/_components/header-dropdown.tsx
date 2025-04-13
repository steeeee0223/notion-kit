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
          <DropdownMenuItem onClick={onCreateWorkspace}>
            <PlusSquare className="mr-2 size-4 text-icon" />
            Join or create workspace
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout}>
            <XCircle className="mr-2 size-4 text-icon" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
