import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";

import { useIsClient } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  MenuItemAction,
  MenuItemSelect,
} from "@notion-kit/ui/primitives";

import { MenuHeader, SortableDnd } from "../common";
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
      <DropdownMenuGroup>
        <DropdownMenuItem
          closeOnClick={false}
          label="Group by"
          onClick={() =>
            table.setTableMenuState({
              open: true,
              page: TableViewMenuPage.SelectGroupBy,
            })
          }
        >
          <MenuItemSelect>{col?.name ?? ""}</MenuItemSelect>
        </DropdownMenuItem>
        {/* TODO Sort group by */}
        <DropdownMenuCheckboxItem
          closeOnClick={false}
          label="Hide empty groups"
          checked={hideEmptyGroups}
          onCheckedChange={table.toggleHideEmptyGroups}
        />
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel title="Groups">
          <div className="ml-auto">
            <Button
              tabIndex={0}
              variant="soft-blue"
              className="h-[initial] min-w-0 shrink bg-transparent px-1.5 py-0.5 text-xs/tight shadow-none"
              onClick={table.toggleAllGroupsVisible}
            >
              {table.getIsSomeGroupVisible() ? "Hide all" : "Show all"}
            </Button>
          </div>
        </DropdownMenuLabel>
        <div className="flex flex-col">
          <SortableDnd
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
          </SortableDnd>
        </div>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {layout !== "board" && (
          <DropdownMenuItem
            icon={<Icon.Trash />}
            label="Remove grouping"
            onClick={() => table.setGroupingColumn(null)}
          />
        )}
        <DropdownMenuItem
          icon={<Icon.QuestionMarkCircled />}
          label="Learn about grouping"
          onClick={() => {
            if (!isClient) return;
            window.open(
              "https://www.notion.com/help/boards#reorder-columns-&-cards",
              "_blank",
            );
          }}
        />
      </DropdownMenuGroup>
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
    <DropdownMenuItem
      ref={setNodeRef}
      closeOnClick={false}
      style={style}
      icon={
        <div
          key="drag-handle"
          className="mr-2 flex h-6 w-4.5 shrink-0 cursor-grab items-center justify-center fill-icon!"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <Icon.DragHandle className="size-3" />
        </div>
      }
      label={children}
      className="*:data-[slot=menu-item-body]:leading-normal"
    >
      <MenuItemAction className="flex items-center text-muted [&_svg]:fill-current">
        <Button
          tabIndex={0}
          aria-label="Toggle property visibility"
          variant="hint"
          className="size-6"
          onKeyDown={(event) => event.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onVisibilityChange();
          }}
        >
          {visible ? <Icon.Eye /> : <Icon.EyeHide />}
        </Button>
      </MenuItemAction>
    </DropdownMenuItem>
  );
}
