import React, { useMemo, useState } from "react";

import { Icon } from "@notion-kit/icons";
import { Role, User, Workspace } from "@notion-kit/schemas";

import { IconBlock } from "@/icon-block";
import {
  Badge,
  Button,
  DropdownMenuCheckboxItem,
  MenuGroup,
  Sortable,
  TooltipDescription,
  TooltipPreset,
  TooltipProvider,
} from "@/primitives";

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

export const WorkspaceList: React.FC<WorkspaceListProps> = ({
  user,
  activeWorkspace,
  workspaces,
  onSelect,
  onCreateWorkspace,
  onLogout,
}) => {
  const [order, setOrder] = useState(workspaces.map((w) => w.id));

  const workspaceList = useMemo(() => {
    const map = workspaces.reduce<Record<string, Workspace>>(
      (acc, w) => ({ ...acc, [w.id]: w }),
      {},
    );
    return order.map((id) => map[id]!);
  }, [workspaces, order]);

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
        items={order}
        onItemsChange={(orderedIds) => setOrder(orderedIds.map(String))}
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
};

interface WorkspaceItemProps {
  index: number;
  workspace: Workspace;
  activeWorkspace?: string;
  onSelect?: (id: string) => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  index,
  workspace,
  activeWorkspace,
  onSelect,
}) => {
  const { id, name, icon, plan, memberCount, role } = workspace;
  return (
    <Sortable.Item
      id={id}
      index={index}
      render={<div className="flex cursor-grab flex-col" />}
    >
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
        <DropdownMenuCheckboxItem
          role="menuitem"
          tabIndex={-1}
          id={id}
          className="group h-8"
          icon={
            <div>
              <Sortable.Handle
                aria-label={`Move workspace ${name}`}
                className="relative hidden size-5 shrink-0 cursor-grab p-0.5 group-hover:flex"
                render={<Button variant="hint" />}
              >
                <Icon.DragHandle className="size-3 fill-default/45" />
              </Sortable.Handle>
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
      </TooltipPreset>
    </Sortable.Item>
  );
};

interface WorkspaceTitleProps {
  role: Role;
  name: string;
}

const WorkspaceTitle: React.FC<WorkspaceTitleProps> = ({ role, name }) => {
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
};
