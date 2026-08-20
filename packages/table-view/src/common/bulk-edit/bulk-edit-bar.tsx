import { useCallback, useMemo, useState } from "react";
import type React from "react";
import { functionalUpdate, type OnChangeFn } from "@tanstack/react-table";

import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
  type PopoverHandle,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { BulkActionMenu } from "./bulk-action-menu";

interface BulkPopoverPayload {
  content: React.ReactNode;
}

interface BulkEditPopoverContentProps<Data> {
  initialData: Data;
  renderEditor: (data: Data, onChange: OnChangeFn<Data>) => React.ReactNode;
}

function BulkEditPopoverContent<Data>({
  initialData,
  renderEditor,
}: BulkEditPopoverContentProps<Data>) {
  const [data, setData] = useState(initialData);
  const onChange = useCallback<OnChangeFn<Data>>((updater) => {
    setData((previous) => functionalUpdate(updater, previous));
  }, []);

  return renderEditor(data, onChange);
}

export function BulkEditBar({ disabled }: { disabled?: boolean }) {
  const { table } = useTableViewCtx();
  const handle = useMemo(() => Popover.createHandle<BulkPopoverPayload>(), []);

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
                payload && (
                  <PopoverContent align="start" side="bottom" className="w-62">
                    {payload.content}
                  </PopoverContent>
                )
              }
            </Popover>
          </div>
        );
      }}
    </table.Subscribe>
  );
}

interface BulkEditColumnProps {
  columnId: string;
  rowIds: string[];
  disabled?: boolean;
  handle: PopoverHandle<BulkPopoverPayload>;
}

function BulkEditColumn({
  columnId,
  rowIds,
  disabled,
  handle,
}: BulkEditColumnProps) {
  const { table } = useTableViewCtx();
  const column = table.getColumn(columnId);
  if (!column) return null;

  const info = column.getInfo();
  const plugin = column.getPlugin();
  const selectedValues = rowIds.flatMap((rowId) => {
    const cell = table.getRow(rowId).original.properties[columnId] as
      | { value: unknown }
      | undefined;
    return cell ? [cell.value] : [];
  });
  const renderEditor = (data: unknown, onChange: OnChangeFn<unknown>) =>
    plugin.renderCellEditor?.({
      propId: columnId,
      data,
      config: info.config,
      disabled,
      onChange,
      onConfigChange: (updater) => column.updateConfig(updater),
      scope: { kind: "bulk", rowIds, selectedValues },
    });
  const editor = renderEditor(plugin.default.data, (updater) =>
    table.updateCells(
      rowIds,
      columnId,
      functionalUpdate(updater, plugin.default.data),
    ),
  );

  if (!editor) return null;
  if (editor.presentation === "inline") {
    return (
      <TooltipPreset description={info.name} side="top">
        <Button
          variant="cell"
          aria-label={info.name}
          disabled={disabled}
          className="h-7 gap-1 rounded-sm px-1.5 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            table.updateCells(rowIds, columnId, !selectedValues.every(Boolean));
          }}
        >
          {info.icon ? (
            <IconBlock icon={info.icon} className="size-4 p-0" />
          ) : (
            plugin.default.icon
          )}
        </Button>
      </TooltipPreset>
    );
  }
  return (
    <TooltipPreset description={info.name} side="top">
      <PopoverTrigger
        handle={handle}
        payload={{
          content: (
            <BulkEditPopoverContent
              initialData={plugin.default.data}
              renderEditor={(data, onChange) =>
                renderEditor(data, (updater) => {
                  const next = functionalUpdate(updater, data);
                  onChange(next);
                  table.updateCells(rowIds, columnId, next);
                })?.content
              }
            />
          ),
        }}
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
