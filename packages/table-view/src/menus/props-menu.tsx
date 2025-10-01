"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
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
  useMenu,
} from "@notion-kit/shadcn";

import {
  DefaultIcon,
  MenuGroupHeader,
  MenuHeader,
  VerticalDnd,
} from "../common";
import type { ColumnInfo } from "../lib/types";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import { DeletedPropsMenu } from "./deleted-props-menu";
import { EditPropMenu } from "./edit-prop-menu";
import { TypesMenu } from "./types-menu";

/**
 * @summary The menu of all properties
 */
export function PropsMenu() {
  const { table } = useTableViewCtx();
  const { toggleAllColumns } = useTableActions();
  const { openMenu } = useMenu();

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
  const [props, deletedCount] = useMemo(() => {
    const props: ColumnInfo[] = [];
    let deletedCount = 0;
    columnOrder.forEach((propId) => {
      const info = table.getColumnInfo(propId);
      if (!info.isDeleted) {
        props.push({ ...info, id: propId });
      } else {
        deletedCount++;
      }
    });
    return [props, deletedCount];
  }, [columnOrder, table]);
  const { search, results, updateSearch } = useFilter(
    props,
    (prop, v) => prop.name.toLowerCase().includes(v),
    { default: "empty" },
  );
  // Menu actions
  const openTypesMenu = () =>
    openMenu(<TypesMenu propId={null} />, { x: -12, y: -12 });
  const openEditPropMenu = (propId: string) =>
    openMenu(<EditPropMenu propId={propId} />, { x: -12, y: -12 });
  const openDeletedPropsMenu = () =>
    openMenu(<DeletedPropsMenu />, { x: -12, y: -12 });

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <MenuHeader title="Properties" />
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
          onActionClick={() => toggleAllColumns(!noShownProps)}
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
                    onVisibilityChange={(hidden) =>
                      table.setColumnInfo(prop.id, { hidden })
                    }
                  />
                ))
              : (results ?? []).map((prop) => (
                  <PropertyItem
                    key={prop.id}
                    info={prop}
                    onClick={() => openEditPropMenu(prop.id)}
                    onVisibilityChange={(hidden) =>
                      table.setColumnInfo(prop.id, { hidden })
                    }
                  />
                ))}
          </VerticalDnd>
        </div>
      </MenuGroup>
      <MenuGroup>
        {deletedCount > 0 && (
          <MenuItem
            variant="secondary"
            tabIndex={0}
            onClick={openDeletedPropsMenu}
            Icon={<Icon.Trash />}
            Body="Deleted properties"
          >
            <MenuItemAction className="flex items-center text-muted">
              <div className="flex truncate">{deletedCount}</div>
              <Icon.ChevronRight className="transition-out ml-1.5 h-full w-3 fill-current" />
            </MenuItemAction>
          </MenuItem>
        )}
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem
          variant="secondary"
          onClick={openTypesMenu}
          Icon={<Icon.Plus className="size-4" />}
          Body="New property"
        />
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
  onVisibilityChange: (hidden: boolean) => void;
}

const PropertyItem: React.FC<PropertyItemProps> = ({
  draggable,
  info,
  onClick,
  onVisibilityChange,
}) => {
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
            "mr-2 hidden h-6 w-4.5 shrink-0 cursor-grab items-center justify-center [&_svg]:fill-icon",
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
            onVisibilityChange(!hidden);
          }}
        >
          {hidden ? <Icon.EyeHide /> : <Icon.Eye />}
        </Button>
        <Icon.ChevronRight className="transition-out ml-1.5 h-full w-3" />
      </MenuItemAction>
    </MenuItem>
  );
};
