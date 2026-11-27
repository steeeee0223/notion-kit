import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import { Role, type User, type Workspace } from "@notion-kit/schemas";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Badge,
  DropdownMenuCheckboxItem,
  getSortableItemsAfterDrag,
  MenuGroup,
  Sortable,
  TooltipDescription,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/ui/primitives";

import { planTitle } from "./constant";
import { HeaderDropdown } from "./header-dropdown";

interface WorkspaceListProps {
  user: Pick<User, "email">;
  workspaces: Workspace[];
  activeWorkspace?: string;
  onSelect?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onLogout?: () => void;
}

export function WorkspaceList({
  user,
  activeWorkspace,
  workspaces,
  onSelect,
  onCreateWorkspace,
  onLogout,
}: WorkspaceListProps) {
  const [order, setOrder] = useState<string[]>([]);
  const orderedWorkspaces = new Map(
    workspaces.map((workspace) => [workspace.id, workspace]),
  );
  const sortedWorkspaces = order.flatMap((id) => {
    const workspace = orderedWorkspaces.get(id);
    orderedWorkspaces.delete(id);
    return workspace ? [workspace] : [];
  });
  const workspaceList = [...sortedWorkspaces, ...orderedWorkspaces.values()];

  return (
    <TooltipProvider>
      <div className="mx-3 mt-2 flex h-5 items-center justify-between text-secondary transition-opacity">
        <div className="mr-1.5 truncate text-xs font-medium">{user.email}</div>
        <HeaderDropdown
          onCreateWorkspace={onCreateWorkspace}
          onLogout={onLogout}
        />
      </div>
      <Sortable.Root
        onDragEnd={(event) => {
          const ids = workspaceList.map((workspace) => workspace.id);
          setOrder(getSortableItemsAfterDrag(ids, event));
        }}
      >
        <Sortable.List render={<MenuGroup />}>
          {workspaceList.map((workspace, index) => (
            <WorkspaceItem
              key={workspace.id}
              workspace={workspace}
              index={index}
              activeWorkspace={activeWorkspace}
              onSelect={onSelect}
            />
          ))}
        </Sortable.List>
      </Sortable.Root>
    </TooltipProvider>
  );
}

interface WorkspaceItemProps {
  index: number;
  workspace: Workspace;
  activeWorkspace?: string;
  onSelect?: (id: string) => void;
}

function WorkspaceItem({
  index,
  workspace,
  activeWorkspace,
  onSelect,
}: WorkspaceItemProps) {
  const { id, name, icon, plan, memberCount, role } = workspace;
  return (
    <TooltipPreset
      side="right"
      sideOffset={8}
      description={
        <>
          <TooltipDescription text={planTitle[plan]} />
          <TooltipDescription
            type="secondary"
            text={`${memberCount} members`}
          />
        </>
      }
      disabled={role === Role.GUEST}
    >
      <Sortable.Item
        id={id}
        index={index}
        render={
          <DropdownMenuCheckboxItem
            className="group h-8"
            tabIndex={-1}
            icon={
              <div>
                <Sortable.Handle
                  aria-label={`Move workspace ${name}`}
                  className="relative hidden size-5 group-hover:flex"
                />
                <IconBlock
                  className="group-hover:hidden"
                  icon={icon ?? { type: "text", src: name }}
                />
              </div>
            }
            checked={id === activeWorkspace}
            label={<WorkspaceTitle role={role} name={name} />}
            onClick={() => onSelect?.(id)}
          />
        }
      />
    </TooltipPreset>
  );
}

interface WorkspaceTitleProps {
  role: Role;
  name: string;
}

function WorkspaceTitle({ role, name }: WorkspaceTitleProps) {
  if (role !== Role.GUEST) return name;
  return (
    <>
      <span className="shrink">{name}</span>
      <Badge
        variant="orange"
        size="sm"
        className="ml-2 self-center whitespace-nowrap uppercase select-none"
      >
        <Icon.Globe className="mr-0.5 size-2.5 fill-orange" />
        Guest
      </Badge>
    </>
  );
}
