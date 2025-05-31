"use client";

import React, { useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { Role, User, Workspace } from "@notion-kit/schemas";
import {
  Badge,
  Button,
  DropdownMenuCheckboxItem,
  MenuGroup,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

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
  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });

  const [order, setOrder] = useState(workspaces.map((w) => w.id));
  const onDragEnd = (e: DragEndEvent) => {
    // reorder columns after drag & drop
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      return arrayMove(prev, oldIndex, newIndex); //this is just a splice util
    });
  };

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
      <MenuGroup>
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
          sensors={[sensor]}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {workspaceList.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                workspace={workspace}
                activeWorkspace={activeWorkspace}
                onSelect={onSelect}
              />
            ))}
          </SortableContext>
        </DndContext>
      </MenuGroup>
    </TooltipProvider>
  );
};

interface WorkspaceItemProps {
  workspace: Workspace;
  activeWorkspace?: string;
  onSelect?: (id: string) => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  activeWorkspace,
  onSelect,
}) => {
  const { id, name, icon, plan, memberCount, role } = workspace;
  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="flex cursor-grab flex-col"
    >
      <TooltipPreset
        side="right"
        sideOffset={8}
        description={[
          { type: "default", text: planTitle[plan] },
          { type: "secondary", text: `${memberCount} members` },
        ]}
        disabled={role === Role.GUEST}
      >
        <DropdownMenuCheckboxItem
          ref={setActivatorNodeRef}
          role="menuitem"
          tabIndex={-1}
          id={id}
          className="group h-8"
          Icon={
            <div>
              <Button
                variant="hint"
                className="relative hidden size-5 shrink-0 cursor-grab p-0.5 group-hover:flex"
              >
                <Icon.DragHandle className="size-3 fill-default/45" />
              </Button>
              <IconBlock
                className="group-hover:hidden"
                icon={icon ?? { type: "text", src: name }}
              />
            </div>
          }
          checked={id === activeWorkspace}
          Body={<WorkspaceTitle role={role} name={name} />}
          {...listeners}
          onSelect={() => onSelect?.(id)}
        />
      </TooltipPreset>
    </div>
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
