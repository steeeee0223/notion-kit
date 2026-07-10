// @ts-nocheck
import type { ColumnDef } from "@tanstack/react-table";

import type { Row } from "../lib/types";

export const defaultColumn: Partial<ColumnDef<Row>> = {
  size: 200,
  minSize: 100,
  maxSize: Number.MAX_SAFE_INTEGER,
  header: () => null,
  cell: () => null,
  footer: () => null,
};
