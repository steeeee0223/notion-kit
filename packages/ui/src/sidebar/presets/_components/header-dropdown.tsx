import { Icon } from "@notion-kit/icons";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/primitives";

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
      <DropdownMenuTrigger
        render={
          <Button
            variant={null}
            className="relative flex size-5 text-secondary"
            aria-label="More actions"
          >
            <Icon.Dots className="size-3 fill-current" />
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            icon={<Icon.SquarePlus className="size-4" />}
            label="Join or create workspace"
            onClick={onCreateWorkspace}
          />

          <DropdownMenuItem
            icon={<Icon.CircleCross className="size-4" />}
            label="Log out"
            onClick={onLogout}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
