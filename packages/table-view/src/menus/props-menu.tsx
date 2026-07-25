import React, { useState } from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { TableViewMenuPage } from "@notion-kit/table-hook";
import type { ColumnInfo } from "@notion-kit/table-hook";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  Button,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  MenuItemAction,
  MenuItemSelect,
  Sortable,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, MenuGroupHeader, MenuHeader } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

/**
 * @summary The menu of all properties
 */
export function PropsMenu() {
  const { table } = useTableViewCtx();
  const { columnOrder } = table.store.state;
  const noShownProps = table.countVisibleColumns() === 1;

  const [search, setSearch] = useState("");
  const { props, deletedCount } = columnOrder.reduce(
    (acc, propId) => {
      const info = table.getColumnInfo(propId);
      if (!info.isDeleted) {
        acc.props.push({ ...info, id: propId });
      } else {
        acc.deletedCount++;
      }
      return acc;
    },
    { deletedCount: 0, props: [] as ColumnInfo[] },
  );

  // Menu actions
  const openEditPropMenu = (propId: string) =>
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.EditProp,
      id: propId,
    });

  return (
    <>
      <MenuHeader
        title="Properties"
        onBack={() => table.setTableMenuState({ open: true, page: null })}
      />
      <Autocomplete
        items={props}
        itemToStringValue={(prop) => prop.name}
        value={search}
        onValueChange={setSearch}
        open
        autoHighlight="always"
        openOnInputClick
      >
        <AutocompleteInput
          clear
          onCancel={() => setSearch("")}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Search for a property..."
        />
        <AutocompleteContent variant="inline">
          <AutocompleteList>
            <AutocompleteGroup>
              <MenuGroupHeader
                title="Properties"
                action={search ? null : noShownProps ? "Show all" : "Hide all"}
                onActionClick={table.toggleAllColumnsVisible}
              />
              <Sortable.Root
                disabled={search.length > 0}
                onDragEnd={table.handleColumnDragEnd}
              >
                <Sortable.List>
                  <AutocompleteCollection>
                    {(prop: ColumnInfo) => (
                      <PropertyItem
                        key={prop.id}
                        index={props.findIndex((item) => item.id === prop.id)}
                        draggable={search.length === 0}
                        info={prop}
                        onClick={() => openEditPropMenu(prop.id)}
                        onVisibilityChange={() =>
                          table.setColumnInfo(prop.id, {
                            hidden: !prop.hidden,
                          })
                        }
                      />
                    )}
                  </AutocompleteCollection>
                </Sortable.List>
              </Sortable.Root>
            </AutocompleteGroup>
          </AutocompleteList>
          <AutocompleteEmpty className="px-3 text-start text-muted">
            No results
          </AutocompleteEmpty>
        </AutocompleteContent>
      </Autocomplete>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          variant="secondary"
          icon={<Icon.Plus className="size-4" />}
          label="New property"
          closeOnClick={false}
          onClick={() =>
            table.setTableMenuState({
              open: true,
              page: TableViewMenuPage.CreateProp,
            })
          }
        />
        {deletedCount > 0 && (
          <DropdownMenuItem
            variant="secondary"
            icon={<Icon.Trash />}
            label="Deleted properties"
            closeOnClick={false}
            onClick={() =>
              table.setTableMenuState({
                open: true,
                page: TableViewMenuPage.DeletedProps,
              })
            }
          >
            <MenuItemSelect>{deletedCount}</MenuItemSelect>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="secondary"
          onClick={() =>
            window.open("https://www.notion.com/help/database-properties")
          }
          icon={<Icon.Help className="size-4" />}
          label="Learn about properties"
        />
      </DropdownMenuGroup>
    </>
  );
}

interface PropertyItemProps {
  draggable?: boolean;
  index: number;
  info: ColumnInfo;
  onClick: () => void;
  onVisibilityChange: () => void;
}

function PropertyItem({
  draggable,
  index,
  info,
  onClick,
  onVisibilityChange,
}: PropertyItemProps) {
  const { id, name, icon, hidden, type } = info;

  return (
    <Sortable.Item
      id={id}
      index={index}
      disabled={!draggable}
      render={
        <AutocompleteItem
          label={name}
          value={info}
          onClick={onClick}
          icon={[
            <Sortable.Handle
              key="drag-handle"
              aria-label={`Move ${name}`}
              className={cn("mr-2 hidden h-6 w-4.5", draggable && "flex")}
            />,
            <React.Fragment key="icon">
              {icon ? <IconBlock icon={icon} /> : <DefaultIcon type={type} />}
            </React.Fragment>,
          ]}
          className="*:data-[slot=menu-item-body]:leading-normal"
        />
      }
    >
      <MenuItemAction className="flex items-center text-muted [&_svg]:fill-current">
        <Button
          tabIndex={0}
          aria-label={`Toggle ${name} visibility`}
          disabled={type === "title"}
          variant="hint"
          className="size-6 p-0 disabled:opacity-40"
          onClick={(e) => {
            e.stopPropagation();
            onVisibilityChange();
          }}
        >
          {hidden ? <Icon.EyeHide /> : <Icon.Eye />}
        </Button>
        <Icon.Chevron
          side="right"
          className="ml-1.5 h-full w-3 animate-bg-out fill-icon"
        />
      </MenuItemAction>
    </Sortable.Item>
  );
}
