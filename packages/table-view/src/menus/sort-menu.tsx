"use client";

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

import { Icon } from "@notion-kit/icons";
import { MenuGroup, MenuItem, useMenu } from "@notion-kit/shadcn";

import { useTableViewCtx } from "../table-contexts";

export function SortMenu() {
  const { closeMenu } = useMenu();
  const { table, properties } = useTableViewCtx();
  const sorting = table.getState().sorting;

  const openSelectMenu = () => {
    console.log("open select menu");
  };
  const updateSorting = (index: number, columnSort: ColumnSort) =>
    table.setSorting((prev) => {
      const newSort = [...prev];
      newSort[index] = columnSort;
      return newSort;
    });
  const reorderSorting = (e: DragEndEvent) => {
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
          onDragEnd={reorderSorting}
        >
          <SortableContext
            items={sorting.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sorting.map((prop) => (
              <SortRule
                key={prop.id}
                id={prop.id}
                desc={prop.desc}
                name={properties[prop.id]!.name}
                onUpdate={updateSorting}
              />
            ))}
          </SortableContext>
        </DndContext>
      </MenuGroup>
      <MenuGroup>
        <MenuItem
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
  desc?: boolean;
  name: string;
  onUpdate: (index: number, columnSort: ColumnSort) => void;
}

function SortRule({ id, desc, name }: SortRuleProps) {
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
    // TODO update the UI
    <MenuItem
      ref={setNodeRef}
      style={style}
      Icon={
        <div key="drag-handle" {...attributes} {...listeners}>
          <Icon.DragHandle className="size-3" />
        </div>
      }
      Body={name}
      // TODO update sorting
    >
      {desc ? "Descending" : "Ascending"}
    </MenuItem>
  );
}
