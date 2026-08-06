import {
  functionalUpdate,
  rowSelectionFeature,
  type RowSelectionState,
} from "@tanstack/react-table";

import type { _TableInstance } from "@/features/types";
import type { Row } from "@/lib/types";

export function pruneRowSelection(
  selection: RowSelectionState,
  data: readonly Pick<Row, "id">[],
) {
  const rowIds = new Set(data.map((row) => row.id));
  const next = Object.fromEntries(
    Object.entries(selection).filter(([rowId]) => rowIds.has(rowId)),
  ) as RowSelectionState;

  return Object.keys(next).length === Object.keys(selection).length
    ? selection
    : next;
}

export const InternalRowSelectionFeature: typeof rowSelectionFeature = {
  ...rowSelectionFeature,
  getDefaultTableOptions: (_table) => {
    const table = _table as unknown as _TableInstance;

    return {
      ...rowSelectionFeature.getDefaultTableOptions?.(_table),
      onRowSelectionChange: (updater) => {
        if (table.atoms.tableGlobal.get().locked) return;

        table.baseAtoms.rowSelection.set((selection) =>
          pruneRowSelection(
            functionalUpdate(updater, selection),
            table.options.data,
          ),
        );
      },
    };
  },
  constructTableAPIs: (_table) => {
    rowSelectionFeature.constructTableAPIs?.(_table);

    const table = _table as unknown as _TableInstance;
    const setOptions = table.setOptions.bind(table);
    table.setOptions = (updater) => {
      table._reactivity.batch(() => {
        setOptions(updater);
        table.baseAtoms.rowSelection.set((selection) =>
          table.atoms.tableGlobal.get().locked
            ? Object.keys(selection).length === 0
              ? selection
              : {}
            : pruneRowSelection(selection, table.options.data),
        );
      });
    };
  },
};
