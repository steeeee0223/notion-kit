"use client";

import React, { createContext, use } from "react";
import type {
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import type { Table } from "@tanstack/react-table";

import type { IconData } from "@notion-kit/icon-block";

import { CountMethod } from "../features";
import type { Column, PluginType, Row } from "../lib/types";
import type { Entity } from "../lib/utils";
import type { CellPlugin, InferKey } from "../plugins";
import type { TableViewAction } from "./table-reducer";
import type { AddColumnPayload, UpdateColumnPayload } from "./types";

export interface TableViewCtx<TPlugins extends CellPlugin[] = CellPlugin[]> {
  plugins: Entity<TPlugins[number]>;
  table: Table<Row<TPlugins>>;
  properties: Record<string, Column<TPlugins[number]>>;
  dataOrder: string[];
  columnSizeVars: Record<string, number>;
  isPropertyUnique: (name: string) => boolean;
  canFreezeProperty: (id: string) => boolean;
  getColumnCount: <TPlugin extends CellPlugin>(
    colId: string,
    type: InferKey<TPlugin>,
    method: CountMethod,
  ) => string;
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

export interface TableActions<TPlugins extends CellPlugin[] = CellPlugin[]> {
  dispatch: React.Dispatch<TableViewAction<TPlugins>>;
  addColumn: (data: AddColumnPayload<TPlugins>) => void;
  updateColumn: (
    id: string,
    data: UpdateColumnPayload<TPlugins[number]>,
  ) => void;
  toggleAllColumns: (hidden: boolean) => void;
  updateColumnType: (id: string, type: PluginType<TPlugins>) => void;
  freezeColumns: (id: string | null) => void;
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
