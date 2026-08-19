import { useMemo } from "react";
import type React from "react";
import { functionalUpdate } from "@tanstack/react-table";

import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { BulkActionMenu } from "./bulk-action-menu";

interface BulkPopoverPayload {
  content: React.ReactNode;
}

export function BulkEditBar({ disabled }: { disabled?: boolean }) {
  const { table } = useTableViewCtx();
  return (
    <table.Subscribe
      selector={(state) => ({
        rowSelection: state.rowSelection,
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
        columnsInfo: state.columnsInfo,
      })}
    >
      {() => {
        const rowIds = table.getSelectedRowIds();
        if (!rowIds.length) return null;
        const columnIds = table
          .getVisibleLeafColumns()
          .filter((column) => {
            const plugin = table.getColumnPlugin(column.id);
            return plugin.renderCellEditor && !plugin.disableBulkEdit;
          })
          .map((column) => column.id);
        return (
          <BulkEditControls
            columnIds={columnIds}
            rowIds={rowIds}
            disabled={disabled}
          />
        );
      }}
    </table.Subscribe>
  );
}

function BulkEditControls({
  columnIds,
  rowIds,
  disabled,
}: {
  columnIds: string[];
  rowIds: string[];
  disabled?: boolean;
}) {
  const handle = useMemo(() => Popover.createHandle<BulkPopoverPayload>(), []);
  return (
    <div
      data-testid="bulk-edit-bar"
      className="sticky inset-s-0 top-0 z-(--z-row) flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border bg-main px-2 py-1 whitespace-nowrap shadow-sm"
    >
      <span className="px-1 text-sm text-blue">
        {rowIds.length} row{rowIds.length === 1 ? "" : "s"} selected
      </span>
      <div className="flex w-fit items-center gap-1">
        {columnIds.map((columnId) => (
          <BulkEditColumn
            key={columnId}
            columnId={columnId}
            rowIds={rowIds}
            disabled={disabled}
            handle={handle}
          />
        ))}
      </div>
      <BulkActionMenu rowIds={rowIds} />
      <Popover handle={handle}>
        {({ payload }) =>
          payload ? (
            <PopoverContent align="start" side="bottom" className="w-62">
              {payload.content}
            </PopoverContent>
          ) : null
        }
      </Popover>
    </div>
  );
}

function BulkEditColumn({
  columnId,
  rowIds,
  disabled,
  handle,
}: {
  columnId: string;
  rowIds: string[];
  disabled?: boolean;
  handle: ReturnType<typeof Popover.createHandle<BulkPopoverPayload>>;
}) {
  const { table } = useTableViewCtx();
  const column = table.getColumn(columnId);
  if (!column) return null;
  const info = column.getInfo();
  const plugin = table.getColumnPlugin(columnId);
  const selectedValues = rowIds.flatMap((rowId) => {
    const cell = table.getRow(rowId).original.properties[columnId];
    return cell ? [cell.value] : [];
  });
  const editor = plugin.renderCellEditor?.({
    propId: columnId,
    data: plugin.default.data,
    config: info.config,
    disabled,
    onChange: (updater) =>
      table.updateCells(
        rowIds,
        columnId,
        functionalUpdate(updater, plugin.default.data),
      ),
    onConfigChange: column.updateConfig,
    scope: { kind: "bulk", rowIds, selectedValues },
  });
  if (!editor) return null;
  if (editor.presentation === "inline") return editor.content;
  return (
    <TooltipPreset description={info.name} side="top">
      <PopoverTrigger
        handle={handle}
        payload={{ content: editor.content }}
        render={
          <Button
            variant="cell"
            aria-label={info.name}
            disabled={disabled}
            className="h-7 gap-1 rounded-sm px-1.5 text-sm"
          >
            {info.icon ? (
              <IconBlock icon={info.icon} className="size-4 p-0" />
            ) : (
              plugin.default.icon
            )}
          </Button>
        }
      />
    </TooltipPreset>
  );
}
