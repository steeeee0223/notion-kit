import { useCallback, useEffect, useRef, useState } from "react";

import type {
  CalendarEventChange,
  CalendarEventValue,
} from "@notion-kit/ui/calendar";

import { useTableViewCtx } from "@/table-contexts";

import {
  calendarValueToDate,
  createCalendarCellUpdater,
} from "./calendar-adapter";

export function useCalendarActions({
  propertyId,
  timeZone,
  locked,
}: {
  propertyId: string;
  timeZone: string;
  locked: boolean;
}) {
  const { table } = useTableViewCtx();
  const pendingIds = useRef(new Set<string>());
  const [lastProposedRowId, setLastProposedRowId] = useState<string | null>(
    null,
  );
  const data = table.options.data;

  useEffect(() => {
    if (lastProposedRowId === null) return;
    for (const row of data) {
      if (!pendingIds.current.delete(row.id)) continue;
      table.openRow(row.id);
    }
  }, [data, table, lastProposedRowId]);

  const onCreate = useCallback(
    (value: CalendarEventValue) => {
      if (locked) return;
      const id = table.addRow({
        initialValues: { [propertyId]: calendarValueToDate(value, timeZone) },
      });
      pendingIds.current.add(id);
      // A controlled owner may synchronously accept before addRow returns.
      // Reconcile again after registering the returned proposal ID.
      setLastProposedRowId(id);
    },
    [locked, propertyId, table, timeZone],
  );

  const onEventChange = useCallback(
    (change: CalendarEventChange) => {
      if (locked || !table.options.data.some((row) => row.id === change.id))
        return;
      table.updateCell(
        change.id,
        propertyId,
        createCalendarCellUpdater(change, timeZone),
      );
    },
    [locked, propertyId, table, timeZone],
  );

  return { onCreate, onEventChange };
}
