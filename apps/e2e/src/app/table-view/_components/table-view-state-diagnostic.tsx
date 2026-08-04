"use client";

import { useTableViewCtx } from "@notion-kit/table-view";

export function TableViewStateDiagnostic() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        columnOrder: state.columnOrder,
        columnsInfo: state.columnsInfo,
        sorting: state.sorting,
        grouping: state.grouping,
        groupingState: state.groupingState,
        columnCounting: state.columnCounting,
        tableGlobal: state.tableGlobal,
      })}
    >
      {(state) => {
        const properties = state.columnOrder.flatMap((id) => {
          const property = state.columnsInfo[id];
          return property ? [property] : [];
        });
        const data = table.getCoreRowModel().rows.map((row) => row.original);

        return (
          <section aria-label="Internal table state (not parent controlled)">
            <pre data-testid="internal-state">{JSON.stringify(state)}</pre>
            <pre data-testid="rendered-resource-state">
              {JSON.stringify({ data, properties, view: state.tableGlobal })}
            </pre>
          </section>
        );
      }}
    </table.Subscribe>
  );
}
