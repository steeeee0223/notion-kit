"use client";

import React, { createContext, useContext } from "react";
import type {
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import type { Table } from "@tanstack/react-table";

import type { DatabaseProperty, PropertyType, RowDataType } from "../types";
import type { TableViewAction } from "./table-reducer";
import type { AddColumnPayload, UpdateColumnPayload } from "./types";

export interface TableViewCtx {
  table: Table<RowDataType>;
  properties: Record<string, DatabaseProperty>;
  data: RowDataType[];
  columnSizeVars: Record<string, number>;
  isPropertyUnique: (name: string) => boolean;
  canFreezeProperty: (id: string) => boolean;
  /** DND */
  columnSensors: SensorDescriptor<SensorOptions>[];
}

export const TableViewContext = createContext<TableViewCtx | null>(null);

export const useTableViewCtx = () => {
  const ctx = useContext(TableViewContext);
  if (!ctx)
    throw new Error(
      "`useTableViewCtx` must be used within `TableViewProvider`",
    );
  return ctx;
};

export interface TableActions {
  dispatch: React.Dispatch<TableViewAction>;
  addColumn: (data: AddColumnPayload) => void;
  updateColumn: (id: string, data: UpdateColumnPayload) => void;
  toggleAllColumns: (hidden: boolean) => void;
  updateColumnType: (id: string, type: PropertyType) => void;
  reorderColumns: (e: DragEndEvent) => void;
  duplicateColumn: (id: string) => void;
  freezeColumns: (id: string | null) => void;
  deleteColumn: (id: string) => void;
}

export const TableActionsContext = createContext<TableActions | null>(null);

export const useTableActions = () => {
  const ctx = useContext(TableActionsContext);
  if (!ctx)
    throw new Error(
      "`useTableActions` must be used within `TableActionsProvider`",
    );
  return ctx;
};
