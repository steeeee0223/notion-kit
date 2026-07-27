"use client";

import { useTableViewCtx } from "@notion-kit/table-view";

export function TableViewStateDiagnostic() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        sorting: state.sorting,
        grouping: state.grouping,
        groupingState: state.groupingState,
        columnCounting: state.columnCounting,
      })}
    >
      {(state) => (
        <section aria-label="Internal table state (not parent controlled)">
          <pre data-testid="internal-state">{JSON.stringify(state)}</pre>
        </section>
      )}
    </table.Subscribe>
  );
}
