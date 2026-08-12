import React from "react";
import { flexRender } from "@tanstack/react-table";

import { useIsClient } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  getGroupSortableSortingMethods,
  TableViewMenuPage,
} from "@notion-kit/table-hook";
import {
  Button,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  MenuItemAction,
  MenuItemSelect,
  Sortable,
} from "@notion-kit/ui/primitives";

import { MenuHeader } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

import { getSortingDirectionLabels } from "./sorting-options";

export function EditGroupMenu() {
  const isClient = useIsClient();
  const { table } = useTableViewCtx();

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
        {col && <GroupingMethodControl colId={col.id} />}
        {col && <GroupSortControl colId={col.id} />}
        <table.Subscribe
          selector={(state) => state.groupingState.hideEmptyGroups}
        >
          {(hideEmptyGroups) => (
            <DropdownMenuCheckboxItem
              closeOnClick={false}
              label="Hide empty groups"
              checked={hideEmptyGroups}
              onCheckedChange={table.toggleHideEmptyGroups}
            />
          )}
        </table.Subscribe>
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
        <table.Subscribe
          selector={(state) => ({
            groupOrder: state.groupingState.groupOrder,
            groupVisibility: state.groupingState.groupVisibility,
          })}
        >
          {({ groupOrder, groupVisibility }) => (
            <Sortable.Root onDragEnd={table.handleGroupedRowDragEnd}>
              <Sortable.List>
                {groupOrder.map((groupId, index) => {
                  const renderer = table.getGroupingValueRenderer(groupId);
                  return (
                    <GroupItem
                      key={groupId}
                      id={groupId}
                      index={index}
                      visible={groupVisibility[groupId] ?? true}
                      onVisibilityChange={() =>
                        table.toggleGroupVisible(groupId)
                      }
                    >
                      {flexRender(renderer, {})}
                    </GroupItem>
                  );
                })}
              </Sortable.List>
            </Sortable.Root>
          )}
        </table.Subscribe>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <table.Subscribe selector={(state) => state.tableGlobal.layout}>
          {(layout) =>
            layout !== "board" && (
              <DropdownMenuItem
                icon={<Icon.Trash />}
                label="Remove grouping"
                onClick={() => table.setGroupingColumn(null)}
              />
            )
          }
        </table.Subscribe>
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

function GroupingMethodControl({ colId }: { colId: string }) {
  const { table } = useTableViewCtx();
  const methods = table.getColumnGroupingMethods(colId);
  if (methods.length <= 1) return null;

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.pluginMethods}>
      {() => {
        const selected = table.getSelectedGroupingMethod(colId);
        return (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger label="Group using">
              <MenuItemAction className="text-muted">
                {selected.name}
              </MenuItemAction>
            </DropdownMenuSubTrigger>
            <DropdownMenuContent sideOffset={-4} className="w-50">
              <DropdownMenuRadioGroup
                value={selected.id}
                onValueChange={(methodId: string) =>
                  table.setColumnGroupingMethod(colId, methodId)
                }
              >
                {methods.map((method) => (
                  <DropdownMenuRadioItem
                    key={method.id}
                    value={method.id}
                    closeOnClick={false}
                    label={method.name}
                  />
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuSub>
        );
      }}
    </table.Subscribe>
  );
}

function GroupSortControl({ colId }: { colId: string }) {
  const { table } = useTableViewCtx();
  const plugin = table.getColumnPlugin(colId);
  const methods = getGroupSortableSortingMethods(plugin);

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.pluginMethods}>
      {() => {
        const groupSort = table.getGroupSort();
        const selectedMethodId =
          groupSort.mode === "automatic" ? groupSort.method : undefined;
        const method =
          methods.find((method) => method.id === selectedMethodId) ??
          methods.find(
            (method) => method.id === plugin.sorting?.defaultMethod,
          ) ??
          methods[0];
        const value =
          groupSort.mode === "manual" || !method
            ? "manual"
            : groupSort.desc
              ? "descending"
              : "ascending";
        const labels = method && getSortingDirectionLabels(method);
        const selectedLabel =
          value === "manual"
            ? "Manual"
            : value === "ascending"
              ? labels?.ascending
              : labels?.descending;

        return (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger label="Sort groups">
              <MenuItemAction className="text-muted">
                {selectedLabel}
              </MenuItemAction>
            </DropdownMenuSubTrigger>
            <DropdownMenuContent sideOffset={-4} className="w-50">
              <DropdownMenuRadioGroup
                value={value}
                onValueChange={(nextValue: string) => {
                  if (nextValue === "manual") {
                    table.setGroupSort({ mode: "manual" });
                    return;
                  }
                  if (!method) return;
                  table.setGroupSort({
                    mode: "automatic",
                    method: method.id,
                    desc: nextValue === "descending",
                  });
                }}
              >
                <DropdownMenuRadioItem
                  value="manual"
                  closeOnClick={false}
                  label="Manual"
                />
                {labels && (
                  <>
                    <DropdownMenuRadioItem
                      value="ascending"
                      closeOnClick={false}
                      label={labels.ascending}
                    />
                    <DropdownMenuRadioItem
                      value="descending"
                      closeOnClick={false}
                      label={labels.descending}
                    />
                  </>
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuSub>
        );
      }}
    </table.Subscribe>
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
          icon={
            <Sortable.Handle
              aria-label={`Move ${id} group`}
              className="h-6 w-4.5"
            />
          }
          label={children}
        />
      }
    >
      <MenuItemAction className="flex items-center text-muted [&_svg]:fill-current">
        <Button
          tabIndex={0}
          aria-label={`Toggle ${id} group visibility`}
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
