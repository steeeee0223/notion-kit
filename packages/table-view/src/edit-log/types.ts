import type { IconData } from "@notion-kit/ui/icon-block";

export interface EditLogPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface TableEditLog {
  id: string;
  editedAt: number;
  action: string;
  target: { id?: string; name: string };
  /** Historical property for field edits; omit for table-level actions. */
  property?: RowEditLog["property"];
  summary: string;
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
