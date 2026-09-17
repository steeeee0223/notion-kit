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

  async function page<T>(
    items: T[],
    scope: string,
    signal: AbortSignal,
    cursor?: string,
  ): Promise<EditLogPage<T>> {
    signal.throwIfAborted();
    let offset = 0;
    if (cursor !== undefined) {
      const prefix = `${scope}:`;
      const boundary = z
        .string()
        .startsWith(prefix)
        .transform((value) => value.slice(prefix.length))
        .pipe(
          z
            .string()
            .regex(/^[1-9]\d*$/)
            .transform(Number),
        )
        .pipe(
          z
            .number()
            .int()
            .positive()
            .safe()
            .refine(
              (value) => value % size === 0 && value < items.length,
              "Invalid pagination boundary",
            ),
        );
      offset = boundary.parse(cursor);
    }
    await Promise.resolve();
    signal.throwIfAborted();
    const end = offset + size;
    return {
      items: structuredClone(items.slice(offset, end)),
      nextCursor: end < items.length ? `${scope}:${end}` : null,
    };
  }

  return {
    fetchTableEditLogs: ({ cursor, signal }) =>
      page(fixtures.table, "table", signal, cursor),
    fetchRowEditLogs: ({ rowId, cursor, signal }) =>
      page(
        fixtures.rows.get(rowId) ?? [],
        `row:${encodeURIComponent(rowId)}`,
        signal,
        cursor,
      ),
  };
}
