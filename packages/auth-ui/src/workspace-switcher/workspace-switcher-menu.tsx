import { Icon } from "@notion-kit/icons";
import type { Workspace } from "@notion-kit/schemas";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
} from "@notion-kit/ui/primitives";

import { planTitle } from "./constant";
import { WorkspaceList } from "./workspace-list";

interface WorkspaceSwitcherMenuProps {
  user: { email: string };
  activeWorkspace?: Workspace;
  workspaces: Workspace[];
  disabled?: boolean;
  onCreateAccount?: () => void;
  onCreateWorkspace?: () => void;
  onLogout?: () => void;
  onSelect?: (id: string) => void;
  onOpenSettings?: () => void;
  onInviteMembers?: () => void;
}

export function WorkspaceSwitcherMenu({
  user,
  activeWorkspace,
  workspaces,
  disabled,
  onCreateAccount,
  onCreateWorkspace,
  onLogout,
  onSelect,
  onOpenSettings,
  onInviteMembers,
}: WorkspaceSwitcherMenuProps) {
  const name = activeWorkspace?.name ?? "Workspaces";
  const icon = activeWorkspace?.icon ?? { type: "text", src: name };
  const handleGetMac = () =>
    window.open("https://www.notion.so/desktop", "_blank");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="hint"
            disabled={disabled}
            className="h-8 w-full justify-normal rounded-sm px-3 py-1.5"
          >
            <div className="flex max-w-[150px] items-center gap-x-2">
              {activeWorkspace && <IconBlock size="sm" icon={icon} />}
              <span className="overflow-hidden text-start font-medium text-ellipsis text-primary">
                {name}
              </span>
            </div>
            <Icon.Chevron side="down" className="size-3.5 fill-icon" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-75" align="start" alignOffset={11}>
        {activeWorkspace && (
          <div className="flex flex-col gap-3 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md">
                <IconBlock size="md" icon={icon} />
              </div>
              <div className="flex flex-col truncate">
                <div className="truncate text-sm font-medium text-primary">
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
                className="h-7 px-2 text-xs/tight font-medium text-secondary focus-within:shadow-notion"
                onClick={onOpenSettings}
              >
                <Icon.Settings className="size-3.5 fill-secondary" />
                Settings
              </Button>
              <Button
                tabIndex={0}
                className="h-7 px-2 text-xs/tight font-medium text-secondary focus-within:shadow-notion"
                onClick={onInviteMembers}
              >
                <Icon.PersonCircle className="size-3.5 fill-secondary" />
                People
              </Button>
            </div>
          </div>
        )}
        <Separator />
        <WorkspaceList
          user={user}
          workspaces={workspaces}
          activeWorkspace={activeWorkspace?.id}
          onSelect={onSelect}
          onCreateWorkspace={onCreateWorkspace}
          onLogout={onLogout}
        />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="secondary"
            className="text-xs"
            label="Add another account"
            onClick={onCreateAccount}
          />
          <DropdownMenuItem
            variant="secondary"
            className="text-xs"
            label="Log out"
            onClick={onLogout}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="secondary"
            className="text-xs"
            label="Get Mac App"
            onClick={handleGetMac}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
