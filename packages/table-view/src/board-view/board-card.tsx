"use client";

import React, { useId, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Row } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { useInputField } from "@notion-kit/hooks";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  TooltipPreset,
} from "@notion-kit/shadcn";

import type { Row as RowModel } from "../lib/types";
import { RowActionMenu } from "../menus";
import { useTableViewCtx } from "../table-contexts";

interface BoardCardProps {
  row: Row<RowModel>;
  overlay?: boolean;
}

/**
 * A BoardCard is displayed as a table row
 */
export function BoardCard({ row, overlay }: BoardCardProps) {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const titleCell = row.getTitleCell();

  const [isEditing, setIsEditing] = useState(false);
  const { props } = useInputField({
    id: row.id,
    initialValue: titleCell.cell.value,
    onUpdate: (value) =>
      table.updateCell(
        row.id,
        titleCell.colId,
        (v) => ({ ...v, value }),
        row.parentId,
      ),
  });

  /** DND */
  const {
    attributes,
    isDragging,
    isOver,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: row.id,
    disabled: locked,
    data: { type: "board-card", groupId: row.parentId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      data-slot="board-card"
      data-block-id={row.id}
      className={cn(
        "relative cursor-grab",
        overlay
          ? "cursor-grabbing opacity-80"
          : isDragging
            ? "z-10 rounded-lg opacity-80 shadow-lg ring-2 ring-ring"
            : null,
      )}
      style={style}
    >
      <div
        className={cn(
          "group/card static block h-full min-h-10 animate-bg-in overflow-hidden rounded-lg border border-border-button bg-popover px-2.5 py-2 text-inherit select-none hover:bg-default/5 dark:border-none",
          isOver && "bg-default/10",
          overlay && "pointer-events-none",
        )}
        {...attributes}
        {...listeners}
        role={attributes.role}
        onClick={() => table.openRow(row.id)}
        onKeyDown={() => {
          // noop
        }}
      >
        {/* Card actions */}
        <div className="relative z-10">
          <div
            className={cn(
              "pointer-events-auto absolute end-0 z-20 flex h-6 rounded-sm border border-border text-xs whitespace-nowrap text-secondary shadow-sm",
              "opacity-0 transition-opacity group-hover/card:opacity-100 has-aria-expanded:opacity-100",
            )}
          >
            {/* Title Edit Popover */}
            <Popover open={isEditing} onOpenChange={setIsEditing}>
              <TooltipPreset description="Edit" side="top" className="z-990">
                <PopoverTrigger asChild>
                  <Button
                    variant={null}
                    className="flex rounded-none px-1.5 py-1 text-secondary"
                    aria-label="Edit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon.PencilLine className="fill-current" />
                  </Button>
                </PopoverTrigger>
              </TooltipPreset>
              <PopoverContent
                side="left"
                className="z-990 max-h-[773px] min-h-[38px] w-46 overflow-visible backdrop-filter-none"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  spellCheck
                  className="max-h-[771px] min-h-9 border-none bg-transparent word-break whitespace-pre-wrap caret-primary"
                  variant="flat"
                  {...props}
                />
              </PopoverContent>
            </Popover>
            <Separator orientation="vertical" />
            {/* Row action menu */}
            <Popover>
              <TooltipPreset
                description="Rename, delete, move to and more..."
                side="top"
              >
                <PopoverTrigger asChild>
                  <Button
                    variant={null}
                    className="flex rounded-none px-1.5 py-1 text-secondary"
                    aria-label="Actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon.Dots className="size-4 fill-current" />
                  </Button>
                </PopoverTrigger>
              </TooltipPreset>
              <PopoverContent
                className="z-990 w-[265px]"
                side="bottom"
                onClick={(e) => e.stopPropagation()}
              >
                <RowActionMenu rowId={row.id} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {/* Card title */}
        <div className="relative flex w-auto items-center gap-1 px-1 pt-0.5 pb-1.5">
          {row.original.icon && (
            <IconBlock icon={row.original.icon} className="contents" />
          )}
          <div className="min-h-6 w-auto max-w-full grow text-sm/normal font-medium word-break whitespace-pre-wrap">
            {titleCell.cell.value || (
              <span className="text-muted">New page</span>
            )}
          </div>
        </div>
        {/* Card properties */}
        <div className="flex flex-col">
          {row.getVisibleCells().map((cell) => (
            <React.Fragment key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </React.Fragment>
          ))}
        </div>
      </div>
      {isOver && <div className="absolute inset-x-0 h-1.5 bg-blue/30" />}
    </div>
  );
}

export function PlaceholderBoardCard({ groupId }: { groupId: string }) {
  const cardId = useId();

  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();

  /** DND */
  const { isOver, active, setNodeRef } = useDroppable({
    id: groupId,
    disabled: locked,
    data: { type: "board-card", groupId },
  });
  const isCardOver = isOver && active?.data.current?.type === "board-card";

  return (
    <div
      ref={setNodeRef}
      data-slot="placeholder-board-card"
      data-block-id={cardId}
      className="relative h-0 w-full"
    >
      {isCardOver && <div className="absolute inset-x-0 h-1.5 bg-blue/30" />}
    </div>
  );
}
