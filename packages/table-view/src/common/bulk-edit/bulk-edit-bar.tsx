import { BulkEditorScope } from "@/plugins/renderers";
import { useTableViewCtx } from "@/table-contexts";

import { BulkActionMenu } from "./bulk-action-menu";

export function BulkEditBar({ disabled }: { disabled?: boolean }) {
  const { table, plugins } = useTableViewCtx();

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
            return Boolean(
              plugins.getUiPlugin(table.getColumnPlugin(column.id).id)
                .renderBulkEditor,
            );
          })
          .map((column) => column.id);
        return (
          <div
            data-testid="bulk-edit-bar"
            className="sticky inset-s-0 top-0 z-(--z-row) flex h-8 w-fit max-w-full items-center overflow-x-auto rounded-md border border-border bg-main whitespace-nowrap shadow-sm"
          >
            <span className="inline-flex h-full items-center border-r px-2.5 text-sm text-blue">
              {rowIds.length} row{rowIds.length === 1 ? "" : "s"} selected
            </span>
            {columnIds.map((columnId) => (
              <BulkEditColumn
                key={columnId}
                columnId={columnId}
                disabled={disabled}
              />
            ))}
            <BulkActionMenu rowIds={rowIds} />
          </div>
        );
      }}
    </table.Subscribe>
  );
}

interface BulkEditColumnProps {
  columnId: string;
  disabled?: boolean;
}

function BulkEditColumn({ columnId, disabled }: BulkEditColumnProps) {
  const { table, plugins } = useTableViewCtx();
  const column = table.getColumn(columnId);
  if (!column) return null;

  const plugin = column.getPlugin();
  const uiPlugin = plugins.getUiPlugin(plugin.id);
  return (
    <BulkEditorScope disabled={disabled}>
      {uiPlugin.renderBulkEditor?.({ column }) ?? null}
    </BulkEditorScope>
  );
}
