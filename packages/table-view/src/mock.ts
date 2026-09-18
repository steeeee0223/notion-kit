import { z } from "zod";

import type { ColumnDefs, Row } from "@notion-kit/table-hook";

import { createMockEditLogFixtures } from "./edit-log/mock-fixtures";
import type {
  EditLogPage,
  FetchRowEditLogs,
  FetchTableEditLogs,
} from "./edit-log/types";

export interface MockEditLogOptions {
  data: Row[];
  properties: ColumnDefs;
  pageSize?: number;
}

/** Static sample history; later changes to the supplied fixtures are not recorded. */
export function createMockEditLogApi({
  data,
  properties,
  pageSize = 10,
}: MockEditLogOptions): {
  fetchTableEditLogs: FetchTableEditLogs;
  fetchRowEditLogs: FetchRowEditLogs;
} {
  const size = z.number().int().positive().safe().parse(pageSize);
  const fixtures = createMockEditLogFixtures(
    structuredClone(data),
    structuredClone(properties),
  );

  function page<T>(
    items: T[],
    signal: AbortSignal,
    cursor?: string,
  ): Promise<EditLogPage<T>> {
    signal.throwIfAborted();
    const offset =
      cursor === undefined
        ? 0
        : z.coerce.number().int().nonnegative().safe().parse(cursor);
    const end = offset + size;
    return Promise.resolve({
      items: items.slice(offset, end),
      nextCursor: end < items.length ? String(end) : null,
    });
  }

  return {
    fetchTableEditLogs: ({ cursor, signal }) =>
      page(fixtures.table, signal, cursor),
    fetchRowEditLogs: ({ rowId, cursor, signal }) =>
      page(fixtures.rows.get(rowId) ?? [], signal, cursor),
  };
}
