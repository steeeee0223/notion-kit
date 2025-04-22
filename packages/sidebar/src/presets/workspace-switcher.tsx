import React from "react";
import { ChevronsUpDown } from "lucide-react";

import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import type { User, Workspace } from "@notion-kit/schemas";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
} from "@notion-kit/shadcn";

import { planTitle, WorkspaceList } from "./_components";

interface WorkspaceSwitcherProps {
  user: User;
  activeWorkspace: Workspace;
  workspaces: Workspace[];
  onCreateAccount?: () => void;
  onCreateWorkspace?: () => void;
  onLogout?: () => void;
  onSelect?: (id: string) => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  user,
  activeWorkspace,
  workspaces,
  onCreateAccount,
  onCreateWorkspace,
  onLogout,
  onSelect,
}) => {
  const icon = activeWorkspace.icon ?? {
    type: "text",
    src: activeWorkspace.name,
  };
  const handleGetMac = () =>
    window.open("https://www.notion.so/desktop", "_blank");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="hint"
          className="h-8 w-full justify-normal rounded-sm px-3 py-1.5"
        >
          <div className="flex max-w-[150px] items-center gap-x-2">
            <IconBlock size="sm" icon={icon} />
            <span className="overflow-hidden text-start font-medium text-ellipsis text-primary dark:text-primary/80">
              {activeWorkspace.name}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 size-4 text-primary/45" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[300px]"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col gap-3 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md">
              <IconBlock size="md" icon={icon} />
            </div>
            <div className="flex flex-col truncate">
              <div className="truncate text-sm font-medium text-primary dark:text-primary/80">
                {activeWorkspace.name}
              </div>
              <div className="truncate text-xs text-secondary">
                {planTitle[activeWorkspace.plan]} ·{" "}
                {activeWorkspace.memberCount} member
              </div>
            </div>
          </div>
          <div className="inline-flex gap-2">
            <Button
              tabIndex={0}
              className="h-7 px-2 text-xs/[1.2] font-medium text-secondary focus-within:notion-focus-within"
            >
              <Icon.Settings className="mr-1.5 size-3.5 fill-secondary" />
              Settings
            </Button>
            <Button
              tabIndex={0}
              className="h-7 px-2 text-xs/[1.2] font-medium text-secondary focus-within:notion-focus-within"
            >
              <Icon.InviteMemberSmall className="mr-1.5 size-3.5 fill-secondary" />
              Invite members
            </Button>
          </div>
        </div>
        <Separator />
        <WorkspaceList
          user={{ email: user.email }}
          workspaces={workspaces}
          activeWorkspace={activeWorkspace.id}
          onSelect={onSelect}
          onCreateWorkspace={onCreateWorkspace}
          onLogout={onLogout}
        />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="secondary"
            className="text-xs"
            Body="Add another account"
            onSelect={onCreateAccount}
          />
          <DropdownMenuItem
            variant="secondary"
            className="text-xs"
            Body="Log out"
            onSelect={onLogout}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="secondary"
            className="text-xs"
            Body="Get Mac App"
            onSelect={handleGetMac}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
