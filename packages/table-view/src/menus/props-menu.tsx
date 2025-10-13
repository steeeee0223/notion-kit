"use client";

import React, { useLayoutEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@notion-kit/cn";
import { useFilter } from "@notion-kit/hooks";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Input,
  MenuGroup,
  MenuItem,
  MenuItemAction,
  Separator,
} from "@notion-kit/shadcn";

import {
  DefaultIcon,
  MenuGroupHeader,
  MenuHeader,
  VerticalDnd,
} from "../common";
import type { ColumnInfo } from "../lib/types";
import { TableViewMenuPage } from "../lib/utils";
import { useTableViewCtx } from "../table-contexts";

/**
 * @summary The menu of all properties
 */
export function PropsMenu() {
  const { table, setTableMenu } = useTableViewCtx();

  const { columnOrder, columnVisibility } = table.getState();
  const noShownProps = (() => {
    const count = Object.values(columnVisibility).reduce(
      (acc, shown) => {
        const num = Number(shown) as 0 | 1;
        acc[num]++;
        return acc;
      },
      { [1]: 0, [0]: 0 },
    );
    return count[1] === 1;
  })();
  // Search
  const inputRef = useRef<HTMLInputElement>(null);
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

  const { search, results, updateSearch } = useFilter(
    props,
    (prop, v) => prop.name.toLowerCase().includes(v),
    { default: "empty" },
  );
  // Menu actions
  const openEditPropMenu = (propId: string) =>
    setTableMenu({ open: true, page: TableViewMenuPage.EditProp, id: propId });

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <MenuHeader
        title="Properties"
        onBack={() => setTableMenu({ open: true, page: null })}
      />
      <div className="flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2">
        <Input
          ref={inputRef}
          clear
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          onCancel={() => updateSearch("")}
          placeholder="Search for a property..."
        />
      </div>
      <MenuGroup>
        <MenuGroupHeader
          title={search && !results ? "No results" : "Properties"}
          action={search ? null : noShownProps ? "Show all" : "Hide all"}
          onActionClick={() => table.toggleAllColumnsVisible(!noShownProps)}
        />
        <div className="flex flex-col">
          <VerticalDnd
            items={columnOrder}
            onDragEnd={table.handleColumnDragEnd}
          >
            {search.length === 0
              ? props.map((prop) => (
                  <PropertyItem
                    key={prop.id}
                    draggable
                    info={prop}
                    onClick={() => openEditPropMenu(prop.id)}
                    onVisibilityChange={() =>
                      table.setColumnInfo(prop.id, { hidden: !prop.hidden })
                    }
                  />
                ))
              : (results ?? []).map((prop) => (
                  <PropertyItem
                    key={prop.id}
                    info={prop}
                    onClick={() => openEditPropMenu(prop.id)}
                    onVisibilityChange={() =>
                      table.setColumnInfo(prop.id, { hidden: !prop.hidden })
                    }
                  />
                ))}
          </VerticalDnd>
        </div>
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem
          variant="secondary"
          onClick={() =>
            setTableMenu({ open: true, page: TableViewMenuPage.CreateProp })
          }
          Icon={<Icon.Plus className="size-4" />}
          Body="New property"
        />
        {deletedCount > 0 && (
          <MenuItem
            variant="secondary"
            tabIndex={0}
            onClick={() =>
              setTableMenu({ open: true, page: TableViewMenuPage.DeletedProps })
            }
            Icon={<Icon.Trash />}
            Body="Deleted properties"
          >
            <MenuItemAction className="flex items-center text-muted">
              <div className="flex truncate">{deletedCount}</div>
              <Icon.ChevronRight className="transition-out ml-1.5 h-full w-3 fill-icon" />
            </MenuItemAction>
          </MenuItem>
        )}
        <MenuItem
          variant="secondary"
          onClick={() =>
            window.open("https://www.notion.com/help/database-properties")
          }
          Icon={<Icon.Help className="size-4" />}
          Body="Learn about properties"
        />
      </MenuGroup>
    </>
  );
}

interface PropertyItemProps {
  draggable?: boolean;
  info: ColumnInfo;
  onClick: () => void;
  onVisibilityChange: () => void;
}

function PropertyItem({
  draggable,
  info,
  onClick,
  onVisibilityChange,
}: PropertyItemProps) {
  const { id, name, icon, hidden, type } = info;

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
      onClick={onClick}
      Icon={[
        <div
          key="drag-handle"
          className={cn(
            "mr-2 hidden h-6 w-4.5 shrink-0 cursor-grab items-center justify-center fill-icon!",
            draggable && "flex",
          )}
          {...attributes}
          {...listeners}
        >
          <Icon.DragHandle className="size-3" />
        </div>,
        <React.Fragment key="icon">
          {icon ? <IconBlock icon={icon} /> : <DefaultIcon type={type} />}
        </React.Fragment>,
      ]}
      Body={name}
      className="*:data-[slot=menu-item-body]:leading-normal"
    >
      <MenuItemAction className="flex items-center text-muted [&_svg]:fill-current">
        <Button
          tabIndex={0}
          aria-label="Toggle property visibility"
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
        <Icon.ChevronRight className="transition-out ml-1.5 h-full w-3 fill-icon" />
      </MenuItemAction>
    </MenuItem>
  );
}
