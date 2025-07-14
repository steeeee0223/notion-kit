"use client";

import { useRef } from "react";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
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
import type { ColumnSort } from "@tanstack/react-table";

import { useFilter } from "@notion-kit/hooks";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Input,
  MenuGroup,
  MenuItem,
  MenuItemAction,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useMenu,
} from "@notion-kit/shadcn";

import { DefaultIcon } from "../common";
import { useTableViewCtx } from "../table-contexts";

export function SortMenu() {
  const { openMenu, closeMenu } = useMenu();
  const { table } = useTableViewCtx();
  const sorting = table.getState().sorting;

  const addRuleRef = useRef<HTMLDivElement>(null);
  const openSelectMenu = () => {
    const rect = addRuleRef.current?.getBoundingClientRect() ?? {
      top: 0,
      left: 0,
    };
    openMenu(<PropSelectMenu />, { x: rect.left, y: rect.top + 32 });
  };
  const reorderRules = (e: DragEndEvent) => {
    // reorder after drag & drop
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    table.setSorting((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex); //this is just a splice util
    });
  };
  const removeSorting = () => {
    table.resetSorting();
    closeMenu();
  };

  return (
    <>
      <MenuGroup>
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={reorderRules}
        >
          <SortableContext
            items={sorting.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sorting.map((prop) => (
              <SortRule key={prop.id} {...prop} />
            ))}
          </SortableContext>
        </DndContext>
      </MenuGroup>
      <MenuGroup>
        <MenuItem
          ref={addRuleRef}
          variant="secondary"
          Icon={<Icon.Plus className="size-4" />}
          Body="Add sort"
          onClick={openSelectMenu}
        />
        <MenuItem
          variant="warning"
          className="text-secondary"
          Icon={<Icon.Trash className="size-4" />}
          Body="Delete sort"
          onClick={removeSorting}
        />
      </MenuGroup>
    </>
  );
}

interface SortRuleProps {
  id: string;
  desc: boolean;
}

function SortRule({ id: currentId, desc }: SortRuleProps) {
  const { closeMenu } = useMenu();
  const { table, properties } = useTableViewCtx();
  const current = properties[currentId]!;
  const updateRule = (columnSort: ColumnSort) =>
    table.setSorting((prev) =>
      prev.map((s) => (s.id === currentId ? columnSort : s)),
    );
  const removeRule = () => {
    table.setSorting((prev) => prev.filter((s) => s.id !== currentId));
    const isLastRule = table.getState().sorting.length === 1;
    if (isLastRule) closeMenu();
  };

  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: currentId });
  const style: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <MenuItem
      ref={setNodeRef}
      className="h-9 hover:bg-transparent *:data-[slot=menu-item-body]:mx-0"
      style={style}
      Icon={
        <div key="drag-handle" {...attributes} {...listeners}>
          <Icon.DragHandle className="size-3" />
        </div>
      }
      Body={
        <div className="flex items-center gap-2">
          <Select
            value={currentId}
            onValueChange={(id) => updateRule({ id, desc })}
          >
            <SelectTrigger className="my-0 w-fit max-w-[180px] border border-border">
              <SelectValue aria-label={current.name}>
                <div className="flex items-center gap-2">
                  {current.icon ? (
                    <IconBlock icon={current.icon} />
                  ) : (
                    <DefaultIcon type={current.type} />
                  )}
                  {current.name}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(properties).map(({ id, name, type, icon }) => (
                <SelectItem key={id} value={id}>
                  <div className="flex items-center gap-2">
                    {icon ? (
                      <IconBlock icon={icon} />
                    ) : (
                      <DefaultIcon type={type} />
                    )}
                    {name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={desc ? "desc" : "asc"}
            onValueChange={(value) =>
              updateRule({ id: currentId, desc: value === "desc" })
            }
          >
            <SelectTrigger className="my-0 w-fit max-w-[180px] border border-border">
              <SelectValue aria-label={desc ? "desc" : "asc"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <MenuItemAction className="flex items-center">
        <Button variant="hint" className="size-5" onClick={removeRule}>
          <Icon.Close className="fill-current" />
        </Button>
      </MenuItemAction>
    </MenuItem>
  );
}

function PropSelectMenu() {
  const { closeMenu } = useMenu();
  const { table, properties } = useTableViewCtx();

  /** Search */
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, results, updateSearch } = useFilter(
    Object.values(properties),
    (prop, v) => prop.name.toLowerCase().includes(v),
  );
  /** Select */
  const sortedProps = new Set(table.getState().sorting.map((s) => s.id));
  const selectProp = (id: string) => {
    table.setSorting((prev) => [...prev, { id, desc: false }]);
    closeMenu();
  };

  return (
    <>
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
      <MenuGroup className="h-40 overflow-y-auto">
        {results?.map(({ id, name, type, icon }) => (
          <MenuItem
            key={id}
            Icon={
              icon ? <IconBlock icon={icon} /> : <DefaultIcon type={type} />
            }
            Body={name}
            disabled={sortedProps.has(id)}
            onClick={() => selectProp(id)}
          />
        )) ?? <span className="px-3 text-xs text-muted">No results</span>}
      </MenuGroup>
    </>
  );
}
