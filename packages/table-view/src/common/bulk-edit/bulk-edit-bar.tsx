import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { TextInputPopoverContent } from "@/common";
import { BulkCheckboxEditor } from "@/plugins/checkbox";
import { BulkDateEditor } from "@/plugins/date";
import { BulkSelectEditor } from "@/plugins/select";
import { useTableViewCtx } from "@/table-contexts";

import { BulkActionMenu } from "./bulk-action-menu";

export function BulkEditBar() {
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
        const selectedRowIds = table.getSelectedRowIds();
        if (selectedRowIds.length === 0) return null;

        const columns = table
          .getVisibleLeafColumns()
          .filter(
            (column) => !table.getColumnPlugin(column.id).disableBulkEdit,
          );

        return (
          <div
            data-testid="bulk-edit-bar"
            className="sticky inset-s-0 top-0 z-(--z-row) flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border bg-main px-2 py-1 whitespace-nowrap shadow-sm"
          >
            <span className="px-1 text-sm text-blue">
              {selectedRowIds.length} row
              {selectedRowIds.length === 1 ? "" : "s"} selected
            </span>
            <div className="flex w-fit items-center gap-1">
              {columns.map((column) => (
                <BulkEditColumn
                  key={column.id}
                  columnId={column.id}
                  selectedRowIds={selectedRowIds}
                />
              ))}
            </div>
            <BulkActionMenu rowIds={selectedRowIds} />
          </div>
        );
      }}
    </table.Subscribe>
  );
}

function BulkEditColumn({
  columnId,
  selectedRowIds,
}: {
  columnId: string;
  selectedRowIds: string[];
}) {
  const { table } = useTableViewCtx();
  const column = table.getColumn(columnId);
  if (!column) return null;

  const info = column.getInfo();
  const plugin = table.getColumnPlugin(columnId);
  const update = (value: unknown) =>
    table.updateCells(selectedRowIds, columnId, value);

  return (
    <Popover>
      <TooltipPreset description={info.name} side="top">
        <PopoverTrigger
          render={
            <Button
              variant="cell"
              aria-label={info.name}
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
      <PopoverContent align="start" side="bottom" className="w-62">
        <BulkEditor
          type={plugin.id}
          config={info.config as unknown}
          onUpdate={update}
          onConfigChange={column.updateConfig}
          propId={columnId}
        />
      </PopoverContent>
    </Popover>
  );
}

function BulkEditor({
  type,
  config,
  onUpdate,
  onConfigChange,
  propId,
}: {
  type: string;
  config: unknown;
  onUpdate: (value: unknown) => void;
  onConfigChange: (value: unknown) => void;
  propId: string;
}) {
  switch (type) {
    case "checkbox":
      return <BulkCheckboxEditor onUpdate={onUpdate} />;
    case "select":
      return (
        <BulkSelectEditor
          propId={propId}
          config={config as Parameters<typeof BulkSelectEditor>[0]["config"]}
          value={[]}
          onUpdate={(value) => onUpdate(value.at(-1) ?? null)}
          onConfigChange={onConfigChange}
        />
      );
    case "multi-select":
      return (
        <BulkSelectEditor
          multi
          propId={propId}
          config={config as Parameters<typeof BulkSelectEditor>[0]["config"]}
          value={[]}
          onUpdate={onUpdate}
          onConfigChange={onConfigChange}
        />
      );
    case "date":
      return (
        <BulkDateEditor
          data={{}}
          config={config as Parameters<typeof BulkDateEditor>[0]["config"]}
          onUpdate={onUpdate}
          onConfigChange={onConfigChange}
        />
      );
    case "number":
      return (
        <TextBulkEditor
          onUpdate={(value) => {
            if (value === "") return onUpdate(null);
            const number = Number(value);
            onUpdate(Number.isNaN(number) ? null : String(number));
          }}
        />
      );
    default:
      return <TextBulkEditor onUpdate={onUpdate} />;
  }
}

function TextBulkEditor({ onUpdate }: { onUpdate: (value: string) => void }) {
  return <TextInputPopoverContent value="" onUpdate={onUpdate} />;
}
