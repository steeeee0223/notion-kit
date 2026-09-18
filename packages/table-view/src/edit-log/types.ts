import type { LayoutType } from "@notion-kit/table-hook";
import type { IconData } from "@notion-kit/ui/icon-block";

import type { tableEditLogActions } from "./messages";

export interface EditLogPage<T> {
  items: T[];
  nextCursor: string | null;
}

export type TableEditLogAction = (typeof tableEditLogActions)[number];

export interface TableEditLog {
  id: string;
  editedAt: number;
  action: TableEditLogAction;
  target: { id?: string; name: string };
  /** Historical property for field edits; omit for table-level actions. */
  property?: RowEditLog["property"];
  /** Required for update actions, rendered with the same adapter as row history. */
  cell?: Pick<RowEditLog, "property" | "value" | "textValue">;
  /** Historical grouping property. Omit for removal of grouping. */
  groupBy?: RowEditLog["property"];
  /** Destination layout for a change-layout action. */
  layout?: LayoutType;
}

export interface RowEditLog {
  id: string;
  editedAt: number;
  rowId: string;
  property: {
    id: string;
    name: string;
    icon?: IconData | null;
    type: string;
    config?: unknown;
  };
  value: unknown;
  textValue: string;
}

export type FetchTableEditLogs = (request: {
  cursor?: string;
  signal: AbortSignal;
}) => Promise<EditLogPage<TableEditLog>>;

export type FetchRowEditLogs = (request: {
  rowId: string;
  cursor?: string;
  signal: AbortSignal;
}) => Promise<EditLogPage<RowEditLog>>;

export interface EditLogProps {
  fetchTableEditLogs?: FetchTableEditLogs;
  fetchRowEditLogs?: FetchRowEditLogs;
}

export type EditLogTarget =
  | { type: "table" }
  | { type: "row"; rowId: string; title?: string };
