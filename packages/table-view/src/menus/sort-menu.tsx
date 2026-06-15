import { useState } from "react";
import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ColumnSort } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
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
  MenuItemAction,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, SortableDnd } from "../common";
import { useTableViewCtx } from "../table-contexts";

export function SortMenu() {
  const { table } = useTableViewCtx();

  const sorting = table.getState().sorting;
  const [addingSort, setAddingSort] = useState(false);

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
      <DropdownMenuGroup>
        <SortableDnd items={sorting.map((s) => s.id)} onDragEnd={reorderRules}>
          {sorting.map((prop) => (
            <SortRule key={prop.id} {...prop} />
          ))}
        </SortableDnd>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        <Popover open={addingSort} onOpenChange={setAddingSort}>
          <PopoverTrigger
            render={
              <DropdownMenuItem
                closeOnClick={false}
                variant="secondary"
                icon={<Icon.Plus className="size-4" />}
                label="Add sort"
              />
            }
          />
          <PopoverContent>
            <PropSelectMenu onSelect={() => setAddingSort(false)} />
          </PopoverContent>
        </Popover>
        <DropdownMenuItem
          closeOnClick={false}
          variant="warning"
          className="text-secondary"
          icon={<Icon.Trash />}
          label="Delete sort"
          onClick={() => table.resetSorting()}
        />
      </DropdownMenuGroup>
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
    <DropdownMenuItem
      ref={setNodeRef}
      closeOnClick={false}
      className="h-9"
      style={style}
      icon={
        <div key="drag-handle" {...attributes} {...listeners}>
          <Icon.DragHandle className="size-3 fill-icon!" />
        </div>
      }
      label={
        <div className="grid h-8 w-full grid-cols-2 items-center gap-1.5">
          <Select
            value={currentId}
            onValueChange={(id) => {
              if (id !== null) updateRule({ id, desc });
            }}
          >
            <SelectTrigger className="my-0 w-full max-w-45 border border-border">
              <SelectValue aria-label={current.name}>
                <div className="flex items-center gap-2 truncate">
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
              <SelectGroup>
                {properties.map(({ id, name, type, icon }) => (
                  <SelectItem
                    key={id}
                    value={id}
                    label={name}
                    icon={
                      icon ? (
                        <IconBlock icon={icon} />
                      ) : (
                        <DefaultIcon type={type} />
                      )
                    }
                  />
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={desc ? "desc" : "asc"}
            onValueChange={(value) =>
              updateRule({ id: currentId, desc: value === "desc" })
            }
          >
            <SelectTrigger className="my-0 w-full max-w-45 border border-border">
              <SelectValue aria-label={desc ? "desc" : "asc"}>
                <span className="truncate">
                  {desc ? "Descending" : "Ascending"}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="asc" label="Ascending" />
                <SelectItem value="desc" label="Descending" />
              </SelectGroup>
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
    </DropdownMenuItem>
  );
}

function PropSelectMenu({ onSelect }: { onSelect: () => void }) {
  const { table } = useTableViewCtx();
  const columns = Object.values(table.getState().columnsInfo);
  /** Select */
  const sortedProps = new Set(table.getState().sorting.map((s) => s.id));
  const selectProp = (id: string) => {
    table.setSorting((prev) => [...prev, { id, desc: false }]);
    onSelect();
  };

  return (
    <Autocomplete
      items={columns}
      itemToStringValue={(column) => column.name}
      open
      autoHighlight="always"
      openOnInputClick
    >
      <AutocompleteInput
        clear
        placeholder="Search for a property..."
        onKeyDown={(event) => event.stopPropagation()}
      />
      <AutocompleteContent role="presentation" variant="inline">
        <AutocompleteList>
          <AutocompleteGroup className="h-40 overflow-y-auto">
            <AutocompleteCollection>
              {(column: (typeof columns)[number]) => (
                <AutocompleteItem
                  key={column.id}
                  value={column}
                  onClick={() => selectProp(column.id)}
                  disabled={sortedProps.has(column.id)}
                  icon={
                    column.icon ? (
                      <IconBlock icon={column.icon} />
                    ) : (
                      <DefaultIcon type={column.type} />
                    )
                  }
                  label={column.name}
                />
              )}
            </AutocompleteCollection>
          </AutocompleteGroup>
        </AutocompleteList>
        <AutocompleteEmpty className="px-3 text-start text-muted">
          No results
        </AutocompleteEmpty>
      </AutocompleteContent>
    </Autocomplete>
  );
}
