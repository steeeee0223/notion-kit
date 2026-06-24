import React from "react";
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
  Sortable,
} from "@notion-kit/ui/primitives";

import { MenuHeader } from "../common";
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
        <Sortable.Root
          items={groupOrder}
          onItemsChange={(orderedIds) =>
            table.handleGroupedRowOrderChange(orderedIds.map(String))
          }
        >
          <Sortable.List>
            {groupOrder.map((groupId, index) => {
              const renderer = table.getGroupingValueRenderer(groupId);
              return (
                <GroupItem
                  key={groupId}
                  id={groupId}
                  index={index}
                  visible={groupVisibility[groupId] ?? true}
                  onVisibilityChange={() => table.toggleGroupVisible(groupId)}
                >
                  {flexRender(renderer, {})}
                </GroupItem>
              );
            })}
          </Sortable.List>
        </Sortable.Root>
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
  index: number;
  visible: boolean;
  onVisibilityChange: () => void;
}

function GroupItem({
  id,
  index,
  visible,
  children,
  onVisibilityChange,
}: React.PropsWithChildren<GroupItemProps>) {
  return (
    <Sortable.Item
      id={id}
      index={index}
      render={
        <DropdownMenuItem
          closeOnClick={false}
          icon={<Sortable.Handle className="h-6 w-4.5" />}
          label={children}
        />
      }
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
    </Sortable.Item>
  );
}
