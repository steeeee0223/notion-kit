"use client";

import React, { createContext, use } from "react";
import type {
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import type { Table } from "@tanstack/react-table";

import type { IconData } from "@notion-kit/icon-block";

import type { DatabaseProperty, PropertyType, RowDataType } from "../lib/types";
import { CountMethod } from "../lib/types";
import type { TableViewAction } from "./table-reducer";
import type { AddColumnPayload, UpdateColumnPayload } from "./types";

export interface TableViewCtx {
  table: Table<RowDataType>;
  properties: Record<string, DatabaseProperty>;
  dataOrder: string[];
  showPageIcon: boolean;
  columnSizeVars: Record<string, number>;
  isPropertyUnique: (name: string) => boolean;
  canFreezeProperty: (id: string) => boolean;
  isSomeCountMethodSet: boolean;
  getColumnCount: (colId: string, method: CountMethod) => string;
  /** DND */
  columnSensors: SensorDescriptor<SensorOptions>[];
  rowSensors: SensorDescriptor<SensorOptions>[];
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

type ActionType = "row" | "col";

export interface TableActions {
  dispatch: React.Dispatch<TableViewAction>;
  addColumn: (data: AddColumnPayload) => void;
  updateColumn: (id: string, data: UpdateColumnPayload) => void;
  toggleAllColumns: (hidden: boolean) => void;
  updateColumnType: (id: string, type: PropertyType) => void;
  freezeColumns: (id: string | null) => void;
  toggleCountCap: (id: string) => void;
  toggleIconVisibility: () => void;
  addRow: (src?: { id: string; at: "prev" | "next" }) => void;
  updateRowIcon: (id: string, icon: IconData | null) => void;
  reorder: (e: DragEndEvent, type: ActionType) => void;
  duplicate: (id: string, type: ActionType) => void;
  remove: (id: string, type: ActionType) => void;
}

export const TableActionsContext = createContext<TableActions | null>(null);

export const useTableActions = () => {
  const ctx = use(TableActionsContext);
  if (!ctx)
    throw new Error(
      "`useTableActions` must be used within `TableActionsProvider`",
    );
  return ctx;
};
