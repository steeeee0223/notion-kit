"use client";

import { useState } from "react";
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

import { useFilter } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  MenuGroup,
  MenuItem,
  MenuItemAction,
  TooltipPreset,
} from "@notion-kit/shadcn";
import { TagsInput } from "@notion-kit/tags-input";

import { COLOR, type Color } from "../lib/colors";
import type { OptionConfig, SelectConfig } from "../lib/types";
import { useTableActions } from "../table-contexts";
import { SelectOptionMenu } from "./select-option-menu";

type SelectMenuProps = SelectConfig & {
  propId: string;
  onUpdate?: (values: string[]) => void;
};

export function SelectMenu({ propId, type, config }: SelectMenuProps) {
  const { dispatch } = useTableActions();

  /** Input & Filter */
  const [options, setOptions] = useState<string[]>([]);
  const { search, results, updateSearch } = useFilter(
    Object.values(config.options.items),
    (option, v) => option.name.includes(v),
  );

  const onInputChange = (input: string) => {
    updateSearch(input);
  };
  const onTagSelect = (value: string) => {
    setOptions((prev) => [...prev, value]);
    onInputChange("");
  };
  /** Actions */
  const reorderOptions = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    dispatch({
      type: `update:col:meta:${type}`,
      payload: {
        id: propId,
        action: "update:sort:manual",
        updater: (prev) => {
          const oldIndex = prev.indexOf(active.id as string);
          const newIndex = prev.indexOf(over.id as string);
          return arrayMove(prev, oldIndex, newIndex);
        },
      },
    });
  };
  const validateOptionName = (name: string) => {
    if (!name.trim()) return false;
    return !Object.values(config.options.items).some(
      (option) => option.name === name,
    );
  };
  const updateOption = (
    originalName: string,
    data: {
      name?: string;
      description?: string;
      color?: Color;
    },
  ) =>
    dispatch({
      type: `update:col:meta:${type}`,
      payload: {
        id: propId,
        action: "update:meta",
        payload: { originalName, ...data },
      },
    });
  const deleteOption = (name: string) =>
    dispatch({
      type: `update:col:meta:${type}`,
      payload: { id: propId, action: "delete", payload: { name } },
    });

  return (
    <>
      <div className="z-10 max-h-[240px] flex-shrink-0 overflow-hidden overflow-y-auto border-b border-border">
        <div className="flex min-w-0 flex-1 flex-col items-stretch">
          <div className="z-10 mr-0 mb-0 flex min-h-[34px] w-full cursor-text flex-nowrap items-start overflow-auto bg-input/60 p-[4px_9px] text-sm dark:bg-input/5">
            <TagsInput
              role="combobox"
              type="email"
              size={1}
              placeholder="Search name or emails"
              autoComplete="off"
              value={{ tags: options, input: search }}
              onTagsChange={setOptions}
              onInputChange={onInputChange}
              className="min-h-[34px] min-w-0 flex-grow border-none bg-transparent px-0"
            />
          </div>
        </div>
      </div>
      <MenuGroup>
        <DropdownMenuLabel title="Select an option or create one" />
        <div className="flex flex-col">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={reorderOptions}
          >
            <SortableContext
              items={results?.map((option) => option.id) ?? []}
              strategy={verticalListSortingStrategy}
            >
              {results?.map((option) => (
                <OptionItem
                  key={option.id}
                  option={option}
                  onSelect={onTagSelect}
                  onUpdate={(data) => updateOption(option.name, data)}
                  onDelete={() => deleteOption(option.name)}
                  validateName={validateOptionName}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </MenuGroup>
    </>
  );
}

interface OptionItemProps {
  option: OptionConfig;
  onSelect: (value: string) => void;
  onUpdate: (data: {
    name?: string;
    description?: string;
    color?: Color;
  }) => void;
  onDelete: () => void;
  validateName: (name: string) => boolean;
}

function OptionItem({
  option,
  onSelect,
  onUpdate,
  onDelete,
  validateName,
}: OptionItemProps) {
  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: option.id });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <TooltipPreset
      description={
        option.description
          ? [
              { type: "default", text: option.name },
              { type: "secondary", text: option.description },
            ]
          : option.name
      }
      side="left"
    >
      <MenuItem
        ref={setNodeRef}
        role="menuitem"
        style={style}
        onClick={() => onSelect(option.name)}
        Icon={
          <div
            key="drag-handle"
            className="flex h-6 w-4.5 shrink-0 cursor-grab items-center justify-center"
            {...attributes}
            {...listeners}
          >
            <Icon.DragHandle className="size-3" />
          </div>
        }
        Body={
          <Badge
            variant="tag"
            size="sm"
            className="h-5 max-w-full min-w-0 shrink-0 text-sm leading-5"
            style={{ backgroundColor: COLOR[option.color].rgba }}
          >
            <span className="truncate">{option.name}</span>
          </Badge>
        }
      >
        <MenuItemAction className="flex items-center text-muted">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button tabIndex={0} variant="hint" className="size-5">
                <Icon.Dots className="size-3.5 fill-current" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              sideOffset={0}
              className="w-[220px]"
              collisionPadding={12}
            >
              <SelectOptionMenu
                option={option}
                validateName={validateName}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </MenuItemAction>
      </MenuItem>
    </TooltipPreset>
  );
}
