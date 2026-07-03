import React from "react";
import { flexRender, type Row } from "@tanstack/react-table";

import { useInputField } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { IconBlock } from "@notion-kit/ui/icon-block";
import { Kanban } from "@notion-kit/ui/kanban";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import type { Row as RowModel } from "@/lib/types";
import { RowActionMenu } from "@/menus";
import { useTableViewCtx } from "@/table-contexts";

interface BoardCardProps {
  groupId: string;
  row: Row<RowModel>;
}

/**
 * A BoardCard is displayed as a table row
 */
export function BoardCard({ groupId, row }: BoardCardProps) {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const titleCell = row.getTitleCell();

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

  return (
    <Kanban.Item
      data-block-id={row.id}
      role="button"
      tabIndex={0}
      id={row.id}
      index={row.index}
      group={groupId}
      disabled={locked}
      onClick={() => table.openRow(row.id)}
      onKeyDown={() => {
        // noop
      }}
    >
      {/* Card actions */}
      <div className="relative z-10">
        <div className="pointer-events-auto absolute inset-e-0 z-20 flex h-6 rounded-sm border border-border text-xs whitespace-nowrap text-secondary opacity-0 shadow-sm transition-opacity group-hover/card:opacity-100 has-aria-expanded:opacity-100">
          {/* Title Edit Popover */}
          <Popover>
            <TooltipPreset description="Edit" side="top">
              <PopoverTrigger
                render={
                  <Button
                    variant={null}
                    className="flex rounded-none px-1.5 py-1 text-secondary"
                    aria-label="Edit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon.PencilLine className="fill-current" />
                  </Button>
                }
              />
            </TooltipPreset>
            <PopoverContent
              side="left"
              className="max-h-[773px] min-h-[38px] w-46 overflow-visible backdrop-filter-none"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                spellCheck
                className="max-h-[771px] min-h-9 border-none bg-transparent wrap-break-word whitespace-pre-wrap caret-primary"
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
              <PopoverTrigger
                render={
                  <Button
                    variant={null}
                    className="flex rounded-none px-1.5 py-1 text-secondary"
                    aria-label="Actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon.Dots className="size-4 fill-current" />
                  </Button>
                }
              />
            </TooltipPreset>
            <PopoverContent
              className="w-[265px]"
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
        <div className="min-h-6 w-auto max-w-full grow text-sm/normal font-medium wrap-break-word whitespace-pre-wrap">
          {titleCell.cell.value || <span className="text-muted">New page</span>}
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
    </Kanban.Item>
  );
}
