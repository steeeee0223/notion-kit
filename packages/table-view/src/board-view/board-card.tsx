"use client";

import React, { useState } from "react";
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
}

/**
 * A BoardCard is displayed as a table row
 */
export function BoardCard({ row }: BoardCardProps) {
  const { table } = useTableViewCtx();

  const [isEditing, setIsEditing] = useState(false);
  const titleCell = row.getTitleCell();
  const { props } = useInputField({
    id: row.id,
    initialValue: titleCell.cell.value,
    onUpdate: (value) =>
      table.updateCell(row.id, titleCell.colId, (v) => ({ ...v, value })),
  });

  return (
    <div data-slot="board-card" data-block-id={row.id}>
      <a
        rel="noopener noreferrer"
        href={`#${row.id}`}
        className="group/card static block h-full min-h-10 animate-bg-in cursor-pointer overflow-hidden rounded-lg bg-popover px-2.5 py-2 text-inherit no-underline select-none"
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
              <PopoverContent className="z-990 w-[265px]" side="bottom">
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
      </a>
    </div>
  );
}
