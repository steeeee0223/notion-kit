"use client";

import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ColumnSort } from "@tanstack/react-table";

import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuGroup,
  MenuItem,
  MenuItemAction,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/shadcn";

import { DefaultIcon, SortableDnd } from "../common";
import { useTableViewCtx } from "../table-contexts";

export function SortMenu() {
  const { table } = useTableViewCtx();
  const sorting = table.getState().sorting;

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

  return (
    <>
      <MenuGroup>
        <SortableDnd items={sorting.map((s) => s.id)} onDragEnd={reorderRules}>
          {sorting.map((prop) => (
            <SortRule key={prop.id} {...prop} />
          ))}
        </SortableDnd>
      </MenuGroup>
      <MenuGroup>
        <Popover>
          <PopoverTrigger asChild>
            <MenuItem
              variant="secondary"
              Icon={<Icon.Plus className="size-4" />}
              Body="Add sort"
            />
          </PopoverTrigger>
          <PopoverContent align="start">
            <PropSelectMenu />
          </PopoverContent>
        </Popover>
        <MenuItem
          variant="warning"
          className="text-secondary"
          Icon={<Icon.Trash />}
          Body="Delete sort"
          onClick={() => table.resetSorting()}
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
  const { table } = useTableViewCtx();

  const current = table.getColumnInfo(currentId);
  const properties = Object.values(table.getState().columnsInfo);

  const updateRule = (columnSort: ColumnSort) =>
    table.setSorting((prev) =>
      prev.map((s) => (s.id === currentId ? columnSort : s)),
    );
  const removeRule = () => {
    table.setSorting((prev) => prev.filter((s) => s.id !== currentId));
    const isLastRule = table.getState().sorting.length === 1;
    if (isLastRule) {
      // TODO close popover
    }
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
          <Icon.DragHandle className="size-3 fill-icon!" />
        </div>
      }
      Body={
        <div className="ml-1 flex h-8 items-center gap-2">
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
              {properties.map(({ id, name, type, icon }) => (
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
  const { table } = useTableViewCtx();
  const columns = Object.values(table.getState().columnsInfo);
  /** Select */
  const sortedProps = new Set(table.getState().sorting.map((s) => s.id));
  const selectProp = (id: string) =>
    table.setSorting((prev) => [...prev, { id, desc: false }]);

  return (
    <Command shouldFilter>
      <CommandInput clear placeholder="Search for a property..." />
      <CommandList>
        <CommandGroup className="h-40 overflow-y-auto">
          {columns.map(({ id, name, type, icon }) => (
            <CommandItem
              key={id}
              value={name}
              onSelect={() => selectProp(id)}
              disabled={sortedProps.has(id)}
              asChild
            >
              <MenuItem
                key={id}
                Icon={
                  icon ? <IconBlock icon={icon} /> : <DefaultIcon type={type} />
                }
                Body={name}
              />
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandEmpty className="px-3 text-start text-muted">
          No results
        </CommandEmpty>
      </CommandList>
    </Command>
  );
}
