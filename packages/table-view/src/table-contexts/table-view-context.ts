"use client";

import { createContext, use } from "react";
import type { SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import type { Table } from "@tanstack/react-table";

import type { IconData } from "@notion-kit/icon-block";

import type { Row } from "../lib/types";
import type { CellPlugin } from "../plugins";

export interface TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> {
  table: Table<Row<TPlugins>>;
  columnSizeVars: Record<string, number>;
  /** DND */
  sensors: SensorDescriptor<SensorOptions>[];
  actions: TableActions;
}

export const TableViewContext = createContext<TableViewCtx | null>(null);

export const useTableViewCtx = () => {
  const ctx = use(TableViewContext);
  if (!ctx)
    throw new Error(
      "`useTableViewCtx` must be used within `TableViewProvider`",
    );
  return ctx;
};

export interface TableActions {
  addRow: (src?: { id: string; at: "prev" | "next" }) => void;
  updateRowIcon: (id: string, icon: IconData | null) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
}
