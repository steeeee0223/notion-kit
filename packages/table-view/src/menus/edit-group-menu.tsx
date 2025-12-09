"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";

import { useIsClient } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuItemSelect,
  MenuItemSwitch,
  Separator,
} from "@notion-kit/shadcn";

import { MenuGroupHeader, MenuHeader, VerticalDnd } from "../common";
import { TableViewMenuPage } from "../features";
import { useTableViewCtx } from "../table-contexts";

export function EditGroupMenu() {
  const isClient = useIsClient();
  const { table } = useTableViewCtx();

  const { layout } = table.getTableGlobalState();
  const { groupOrder, groupVisibility, hideEmptyGroups } =
    table.getState().groupingState;
  const col = table.getGroupedColumnInfo();

  return (
    <>
      <MenuHeader
        title="Group"
        onBack={() => table.setTableMenuState({ open: true, page: null })}
      />
      <MenuGroup>
        <MenuItem
          Body="Group by"
          onClick={() =>
            table.setTableMenuState({
              open: true,
              page: TableViewMenuPage.SelectGroupBy,
            })
          }
        >
          <MenuItemSelect>{col?.name ?? ""}</MenuItemSelect>
        </MenuItem>
        {/* TODO Sort group by */}
        <MenuItemSwitch
          Body="Hide empty groups"
          checked={hideEmptyGroups}
          onCheckedChange={table.toggleHideEmptyGroups}
        />
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuGroupHeader
          title="Groups"
          action={table.getIsSomeGroupVisible() ? "Hide all" : "Show all"}
          onActionClick={table.toggleAllGroupsVisible}
        />
        <div className="flex flex-col">
          <VerticalDnd
            items={groupOrder}
            onDragEnd={table.handleGroupedRowDragEnd}
          >
            {groupOrder.map((groupId) => {
              const renderer = table.getGroupingValueRenderer(groupId);
              return (
                <GroupItem
                  key={groupId}
                  id={groupId}
                  visible={groupVisibility[groupId] ?? true}
                  onVisibilityChange={() => table.toggleGroupVisible(groupId)}
                >
                  {flexRender(renderer, {})}
                </GroupItem>
              );
            })}
          </VerticalDnd>
        </div>
      </MenuGroup>
      <Separator />
      <MenuGroup>
        {layout !== "board" && (
          <MenuItem
            Icon={<Icon.Trash />}
            Body="Remove grouping"
            onClick={() => table.setGroupingColumn(null)}
          />
        )}
        <MenuItem
          Icon={<Icon.QuestionMarkCircled />}
          Body="Learn about grouping"
          onClick={() => {
            if (!isClient) return;
            window.open(
              "https://www.notion.com/help/boards#reorder-columns-&-cards",
              "_blank",
            );
          }}
        />
      </MenuGroup>
    </>
  );
}

interface GroupItemProps {
  id: string;
  visible: boolean;
  onVisibilityChange: () => void;
}

function GroupItem({
  id,
  visible,
  children,
  onVisibilityChange,
}: React.PropsWithChildren<GroupItemProps>) {
  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
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
    <MenuItem
      ref={setNodeRef}
      role="menuitem"
      style={style}
      Icon={
        <div
          key="drag-handle"
          className="mr-2 flex h-6 w-4.5 shrink-0 cursor-grab items-center justify-center fill-icon!"
          {...attributes}
          {...listeners}
        >
          <Icon.DragHandle className="size-3" />
        </div>
      }
      Body={children}
      className="*:data-[slot=menu-item-body]:leading-normal"
    >
      <MenuItemAction className="flex items-center text-muted [&_svg]:fill-current">
        <Button
          tabIndex={0}
          aria-label="Toggle property visibility"
          variant="hint"
          className="size-6"
          onClick={(e) => {
            e.stopPropagation();
            onVisibilityChange();
          }}
        >
          {visible ? <Icon.Eye /> : <Icon.EyeHide />}
        </Button>
      </MenuItemAction>
    </MenuItem>
  );
}
