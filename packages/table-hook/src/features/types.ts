/* eslint-disable @typescript-eslint/no-explicit-any */
// TanStack's custom feature callbacks are generic over any possible feature set.
// Inside feature construction code, using `any` deliberately activates

import type { Row, Table } from "@tanstack/table-core";

import type { Row as RowModel } from "@/lib/types";

// TanStack's broad internal feature-map path.
export type AnyTableFeatures = any;
export type AnyRowData = any;

export type TableInstance = Table<AnyTableFeatures, RowModel>;
export type RowInstance = Row<AnyTableFeatures, RowModel>;
