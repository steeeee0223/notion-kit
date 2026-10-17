import React, { useRef, useState } from "react";
import { flexRender } from "@tanstack/react-table";

import { useInputField } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import type { RowInstance } from "@notion-kit/table-hook";
import { IconBlock } from "@notion-kit/ui/icon-block";
import { Kanban } from "@notion-kit/ui/kanban";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFilter,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { RowActionMenu } from "@/menus";
import { useTableViewCtx } from "@/table-contexts";

interface BoardCardProps {
  groupId: string;
  index: number;
  row: RowInstance;
}

/**
 * A BoardCard is displayed as a table row
 */
export function BoardCard({ groupId, index, row }: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const actionTriggerRef = useRef<HTMLButtonElement>(null);
  const { table } = useTableViewCtx();
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

  if (!groupId) return null;

  return (
    <table.Subscribe
      selector={(state) => ({
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
        columnsInfo: state.columnsInfo,
        locked: state.tableGlobal.locked,
      })}
    >
      {({ locked }) => (
        <Kanban.Item
          data-block-id={row.id}
          role="button"
          tabIndex={0}
          id={row.id}
          index={index}
          group={groupId}
          disabled={locked}
          onClick={() => table.openRow(row.id)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              table.openRow(row.id);
            }
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
              <DropdownMenuFilter>
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <TooltipPreset
                    description="Rename, delete, move to and more..."
                    side="top"
                  >
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant={null}
                          className="flex rounded-none px-1.5 py-1 text-secondary"
                          aria-label="Actions"
                          ref={actionTriggerRef}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon.Dots className="size-4 fill-current" />
                        </Button>
                      }
                    />
                  </TooltipPreset>
                  <DropdownMenuContent
                    className="w-[265px]"
                    side="bottom"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RowActionMenu
                      rowId={row.id}
                      onClose={() => setMenuOpen(false)}
                      getReturnFocus={() => actionTriggerRef.current}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuFilter>
            </div>
          </div>
          <Kanban.ItemHandle className="float-start h-6 w-4 opacity-0 group-hover/card:opacity-100 focus:opacity-100" />
          <BoardCardTitle row={row} />
          {/* Card properties */}
          <div className="flex flex-col">
            {row.getVisibleCells().map((cell) => (
              <React.Fragment key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </React.Fragment>
            ))}
          </div>
        </Kanban.Item>
      )}
    </table.Subscribe>
  );
}

function BoardCardTitle({ row }: { row: RowInstance }) {
  const title = row.getTitleCell().cell.value;
  return (
    <div className="relative flex w-auto items-center gap-1 px-1 pt-0.5 pb-1.5">
      {row.original.icon && (
        <IconBlock icon={row.original.icon} className="contents" />
      )}
      <div className="min-h-6 w-auto max-w-full grow text-sm/normal font-medium wrap-break-word whitespace-pre-wrap">
        {title || <span className="text-muted">New page</span>}
      </div>
    </div>
  );
}

/** Overlay content never mounts editors or sortable registrations. */
export function BoardCardPreview({ row }: { row: RowInstance }) {
  const { table } = useTableViewCtx();
  return (
    <div className="rounded-lg border border-border-button bg-popover px-2.5 py-2 text-sm">
      <BoardCardTitle row={row} />
      {row.getVisibleCells().map((cell) => {
        const plugin = table.getColumnPlugin(cell.column.id);
        const property = row.original.properties[cell.column.id];
        return (
          <div key={cell.id} className="text-secondary">
            {plugin.toTextValue(
              property ? property.value : plugin.default.data,
              row.original,
            )}
          </div>
        );
      })}
    </div>
  );
}
